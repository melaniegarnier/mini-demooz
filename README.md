# miniDemooz
A base to a Demooz web server

## Installation
You need to installed MongoDB. Then use in your terminal :

```
git clone https://github.com/melaniegarnier/mini-demooz.git
cd mini-demooz
npm install
```

## Usage
In the `mini-demooz/` directory :

```
node index.js -h
```

to display help and the commands. 

### First usage
In a terminal, run the MongoDB deamon with :

```
mongod
```

In another terminal, use the `--init` option to fill the database (for example with the `db.json` we provide) :

```
node index.js --init ./test/db.json --conf conf.json
```

Then load the URL `localhost:3344/minidem/` to go to the home page. All the instructions are described there.

> Note : option `--conf` is mandatory to sett the program whereas option `--init` is optional.
> Note bis : you need an internet connection to run.

## Code specifications
- `user` and `product` are objects : what I call `objType`
- an object has a `name`, unique in his type : `Juliette` is unique for the type `user`
- `own` and `test` are relations

## Contact
Mélanie Garnier  
melanie.mc.garnier@gmail.com


