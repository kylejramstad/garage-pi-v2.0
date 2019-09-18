#!/bin/bash
#Add DNS records to alt_names on CertRequestTemplate.cnf

sudo sed '140,$d' CertRequestTemplate.cnf -n
number=$(hostname -I | grep -o ' ' | wc -l)
if [ $number -ne 0 ]
then
        for i in $(seq 1 $number)
        do
                echo "DNS.$((3+$i)) = $(hostname -I | cut -d ' ' -f $i)" >> CertRequestTemplate.cnf
                number=$((3+$i))
        done
fi

for arg in "$@"
do
		number=$((number+1))
        echo "DNS.$number = $arg" >> CertRequestTemplate.cnf
done

#Delete Old Certs and Keys
sudo find . -name "*.pem" -type f -delete
sudo find . -name "*.crt" -type f -delete
sudo mv IntermediateCertDatabase.db.attr.old IntermediateCertDatabase.db.attr    
sudo mv IntermediateCertDatabase.db.old IntermediateCertDatabase.db    
sudo mv IntermediateSerial.seq.old  IntermediateSerial.seq      
sudo mv RootCertDatabase.db.attr.old RootCertDatabase.db.attr    
sudo mv RootCertDatabase.db.old RootCertDatabase.db    
sudo mv RootSerial.seq.old RootSerial.seq  

#ROOT CERT
sudo openssl genrsa -out Root.PrivateKey.pem 4096

sudo openssl req -x509 -new -nodes -key Root.PrivateKey.pem -days 10000 -out Root.Cert.pem -subj "/C=US/ST=CA/L=LA/O=garage-pi/CN=localhost" -config CertRequestTemplate.cnf -extensions v3_root_ca_policy

sudo openssl x509 -noout -text -in Root.Cert.pem

#INTERMEDIATE
sudo openssl genrsa -out Intermediate.PrivateKey.pem 3072

sudo openssl req -new -key Intermediate.PrivateKey.pem -out Intermediate.csr.pem -subj "/C=US/ST=CA/L=LA/O=garage-pi/CN=localhost" -config CertRequestTemplate.cnf -extensions v3_intermediate_ca_policy

sudo openssl ca -verbose -config CertRequestTemplate.cnf -extensions v3_intermediate_ca_policy -in Intermediate.csr.pem -cert Root.Cert.pem -keyfile Root.PrivateKey.pem -out Intermediate.Cert.pem -outdir . -days 3650 -batch

sudo openssl verify -verbose -CAfile Root.Cert.pem Intermediate.Cert.pem

sudo rm Intermediate.csr.pem

#LEAF
sudo openssl genrsa -out Leaf.PrivateKey.pem 2048

sudo openssl req -new -key Leaf.PrivateKey.pem -out Leaf.csr.pem -subj "/C=US/ST=CA/L=LA/O=garage-pi/CN=localhost" -config CertRequestTemplate.cnf

sudo openssl ca -verbose -config CertRequestTemplate.cnf -name intermediate_ca -extensions v3_leaf_policy -in Leaf.csr.pem -cert Intermediate.Cert.pem -keyfile Intermediate.PrivateKey.pem -out Leaf.Cert.pem -outdir . -days 3650 -batch

sudo openssl verify -verbose -CAfile Root.Cert.pem -untrusted Intermediate.Cert.pem Leaf.Cert.pem

sudo rm Leaf.csr.pem

##Combine leaf and intermediate
sudo cat Leaf.Cert.pem Intermediate.Cert.pem > LeafAndIntermediate.Cert.pem
##Combine intermediate and root
sudo cat Intermediate.Cert.pem Root.Cert.pem > IntermediateAndRoot.Cert.pem

##Compatibility
sudo openssl x509 -inform PEM -outform DER -in LeafAndIntermediate.Cert.pem  -out LeafAndIntermediate.Cert.crt
sudo openssl x509 -inform PEM -outform DER -in IntermediateAndRoot.Cert.pem  -out IntermediateAndRoot.Cert.crt
sudo openssl x509 -inform PEM -outform DER -in Root.Cert.pem  -out Root.Cert.crt