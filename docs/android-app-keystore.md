# Generate keystore key

```bash
cd ./android/app
keytool -genkeypair -v -storetype PKCS12 -keystore haqq-key.keystore -alias haqq-wallet -keyalg RSA -keysize 2048 -validity 10000
```

Enter keystore password - password which you would like to use (min 6 symbols)
Re-enter new password - repeat your password

After you will be asking about key owner^ you need to fill at least one fiels

```
What is your first and last name?
  [Unknown]:
What is the name of your organizational unit?
  [Unknown]:  test
What is the name of your organization?
  [Unknown]:
What is the name of your City or Locality?
  [Unknown]:
What is the name of your State or Province?
  [Unknown]:
What is the two-letter country code for this unit?
  [Unknown]:
```

and after confirm it

```
Is CN=Unknown, OU=test, O=Unknown, L=Unknown, ST=Unknown, C=Unknown correct?
  [no]:  yes
```
