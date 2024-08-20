# Shopify Xero App

This is a Shopify Xero app that allows merchants to manage their payment methods.

## About this project

- Customise checkout delivery options
- Hide or show delivery options according to customer type.

## Use Cases

- Church in Sydney customers. The Sydney customer with locality defined, have the option of pick up from district. For example, customer at Ryde can have the delivery option of picking it up from Ryde.
- Customers with pay by invoice tag, will have free delivery option. Delivery address must be pre-defined. Change of address will require delivery fee.

## Stack

- AWS
- SST
- Remix
- Playwright
- testing library

## Local Development

### AWS profile

Create a new AWS profile in `~/.aws/credentials` 

### Cloudfare tunnel

* Zero Trust
* Networks
* Create a tunnel

### Shopify cli
https://shopify.dev/docs/api/shopify-cli

`npm install -g @shopify/cli@latest`

To login into Shopify. Go to project root.

`npm run config:use`

### SST

https://sst.dev/

`npm i sst`

`npm run dev`

## Deployment

`sh script/deploy.sh`

## Shopify Partner

https://partners.shopify.com

## Create the Shopify app


# Troubleshotting

```
# npm run dev
weird json invalid character '<' looking for beginning of value <!DOCTYPE html>
weird json invalid character '<' looking for beginning of value <html lang="en">
weird json invalid character '<' looking for beginning of value <head>
weird json invalid character '<' looking for beginning of value <meta charset="utf-8">
weird json invalid character '<' looking for beginning of value <title>Error</title>
weird json invalid character '<' looking for beginning of value </head>
weird json invalid character '<' looking for beginning of value <body>
weird json invalid character '<' looking for beginning of value <pre>Cannot GET /stream</pre>
weird json invalid character '<' looking for beginning of value </body>
weird json invalid character '<' looking for beginning of value </html>
```
This is because another SST session is running. Stop the other session and run `npm run dev` again.

# How to setup and install Event bridge

1. Create a new event bus in AWS EventBridge

rule to SQS

order create event

setup the XERO account mapping

get customer,
 create customer, or update customer

create product 

create invoice
use the shopify order# as the xero invoice number
save invoice to shopify order, is so that shopify can search by xero invoice number
