# Architecture

![architecture](https://github.com/haqq-network/haqq-wallet/blob/main/docs/images/architecture.png)

## Controller

Responsible for receiving data from models, passing data to the display, and interacting with internal (navigation) and external services.

All controllers placed in src/screens

## View

Deals exclusively with data rendering which came from controller, in some cases it can convert/transform the data only for  match the display format. Сan interact with the controller via callbacks

All views placed in src/components

## Model 

Responses for all stored data layer. All interaction with models happens through the wrapper (not directly through the provider)

All views placed in src/models

## Services

services interact with external and internal services, can interact with models

All views placed in src/services
