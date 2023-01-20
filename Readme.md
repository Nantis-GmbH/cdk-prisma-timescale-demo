# AWS CDK + Timescale + Prisma = ❤

## Monorepo Setup and yarn workspaces + Turborepo

The repository is set up as monorepo using yarns workspace feature. It contains multiple packages in one repository.

To better handle building etc. turborepo is used to coordinate and optimize build tasks, see https://turbo.build/

## Timescale

The Timescale database needs to be version 2.9 and up.

Timescale is a postgres extension suited for timeseries data, see: https://www.timescale.com/

Features used are hypertables, continuous aggregates (also hierarchical) and policies for automatic refresh. The Timezone feature currently does not work with hierarchical CAGGs due to an error which will be fixed in 2.9.2

## Prisma

Prisma is a typescript ORM, see https://www.prisma.io/

Features used are views and extensions

### Migrations

The `packages/prisma` package contains the `schema.prisma` files and a first migration for the database. Some part of the migration is 

There is still the error that timescaledb cannot be loaded during a migration even tough the SQL statement is

`CREATE EXTENSION IF NOT EXISTS "timescaledb";`

The only resolution to initially run the migration is to run `"prisma:migrate:dev:reset": "dotenv -e ../../.env prisma migrate reset"` (see `package.json`) twice quickly after another.

# Deploying the stack
## Prerequisites
This repo assumes you have a AWS account setup with `aws-cdk`. Aou need to bring your own timescale database.

## Steps
1. Provide a `DATABASE_URL` (+`SHADOW_DATABASE_URL` if you want to use the migration commands to full extend)
2. Run `yarn install` This will install all dependencies (also in all workspace packages)
3. Migrate your database ideally you would use the migrate command in the prisma package, but you might need to do the reset command twice, see Open Issues
4. Run `yarn run deploy` to build and synthesize and deploy the aws-cdk stack. (You can also run `yarn run synth` and the run the `cdk deploy` command inside the `app/cloud` directory if you want to pass additional parameters such as `--profile`)

The stack will output a `APIFunctionUrl` which you can paste into the browser to see the data from the continuous aggregates. The database will get a new value each minute from the schedule lambda.

# Destroying the stack

1. Run `yarn destroy` to destroy the stack.

# Open Issues in this repository

1. The `DATABASE_URL` environment variable should better not be passed around in clear text. A configuration parameter (SSM) is better suited.
2. The data is fictional and also you need to think about how to configure CAGGS and policies
