# Medib.com

## Introduction
    
Project for SE II - Software requirement and verification.


## What is it?

This is a restful api of medib.com . It is built using `node.js`, `express` and `mongo db`.

## How can I run it?
	1. You need to copy the env.example file to .env and adding the appropriate values.
	2. Run npm install after cloning
	3. You have to run mongodb first(you can do this by using the command mongod --dbpath=dir/ where dir is where you want your database)
	4. You have to run npm run start

## How can I run the tests?
### The tests also require mongodb, which means you have to run it as said above.
	1. Run  `npm run test` for unit testing.
	2. Run  `npm run apitest` for api testing.
	
#### You can find the android app [here.](https://github.com/nonamereq/medib-android)