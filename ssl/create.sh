#!/bin/bash
#Add DNS records to alt_names on CertRequestTemplate.cnf

echo "DNS.2 = $(hostname)" >> CertRequestTemplate.cnf
echo "DNS.3 = $(hostname).local" >> CertRequestTemplate.cnf

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

#ROOT CERT
openssl genrsa -out Root.PrivateKey.pem 4096

openssl req -x509 -new -nodes -key Root.PrivateKey.pem -days 10000 -out Root.Cert.pem -subj "/C=US/ST=CA/L=LA/O=garage-pi/CN=localhost" -config CertRequestTemplate.cnf -extensions v3_root_ca_policy

openssl x509 -noout -text -in Root.Cert.pem

#INTERMEDIATE
openssl genrsa -out Intermediate.PrivateKey.pem 3072

openssl req -new -key Intermediate.PrivateKey.pem -out Intermediate.csr.pem -subj "/C=US/ST=CA/L=LA/O=garage-pi/CN=localhost" -config CertRequestTemplate.cnf -extensions v3_intermediate_ca_policy

openssl ca -verbose -config CertRequestTemplate.cnf -extensions v3_intermediate_ca_policy -in Intermediate.csr.pem -cert Root.Cert.pem -keyfile Root.PrivateKey.pem -out Intermediate.Cert.pem -outdir . -days 3650 -batch

openssl verify -verbose -CAfile Root.Cert.pem Intermediate.Cert.pem

rm Intermediate.csr.pem

#LEAF
openssl genrsa -out Leaf.PrivateKey.pem 2048

openssl req -new -key Leaf.PrivateKey.pem -out Leaf.csr.pem -subj "/C=US/ST=CA/L=LA/O=garage-pi/CN=localhost" -config CertRequestTemplate.cnf

openssl ca -verbose -config CertRequestTemplate.cnf -name intermediate_ca -extensions v3_leaf_policy -in Leaf.csr.pem -cert Intermediate.Cert.pem -keyfile Intermediate.PrivateKey.pem -out Leaf.Cert.pem -outdir . -days 3650 -batch

openssl verify -verbose -CAfile Root.Cert.pem -untrusted Intermediate.Cert.pem Leaf.Cert.pem

rm Leaf.csr.pem

##Combine leaf and intermediate
cat Leaf.Cert.pem Intermediate.Cert.pem > LeafAndIntermediate.Cert.pem
##Combine intermediate and root
cat Intermediate.Cert.pem Root.Cert.pem > IntermediateAndRoot.Cert.pem

##Compatibility
openssl x509 -inform PEM -outform DER -in LeafAndIntermediate.Cert.pem  -out LeafAndIntermediate.Cert.crt
openssl x509 -inform PEM -outform DER -in IntermediateAndRoot.Cert.pem  -out IntermediateAndRoot.Cert.crt
openssl x509 -inform PEM -outform DER -in Root.Cert.pem  -out Root.Cert.crt


