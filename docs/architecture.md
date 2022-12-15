# Architecture

## Controller

Responsible for receiving data from models, passing data to the display, and interacting with internal (navigation) and external services.

All controllers placed in src/screens

## View

Deals exclusively with data rendering which came from controller, in some cases it can manipulate data (except for writing to the model). can interact with the controller via callbacks

All views placed in src/components

## Model 

Responses for all stored data layer. All interaction with models happens through the wrapper (not directly through the provider)

All views placed in src/models

## Services

services interact with external and internal services, can interact with models

All views placed in src/services
