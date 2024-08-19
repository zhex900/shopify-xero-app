# Shopify Xero App

This is a Shopify admin app that allows merchants to manage their payment methods.

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

`npm run dev`

## Deployment

`sh script/deploy.sh`

How to setup and install Event bridge

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
