# ant-colony
Coding exercises featuring simple agent-based AI

## Build / install

Install `npm`.

```
sudo npm install grunt

git clone --recursive git@github.com:merlinND/ant-colony.git
cd ant-colony
npm install --dev .

# Start grunt watch
grunt
```

The compilation steps will run automatically on start.

## Levels

### Level 1

Introduction to the framework, just run the provided code.

### Level 2

Introduction to functions and variables:

- receive several arguments
- compute euclidean distance and return it
- could show that if they get it wrong, behavior changes (e.g. going to furthest food instead of closest)

### Level 3

Introduction to conditions: receive a food item with several properties: age, poison. Should return true only if the food item is edible.

### Level 4

Introduction to loops: return the closest food in given list of foods (keep track of minimum).

### Level 5

Loops and conditions: call your `is_edible` function to only return the closest that is edible.


## Deployment

On an Ubuntu 16.04 web server:

```
sudo apt-get install npm
sudo npm install -g pm2

cd /var/www
git clone --recursive git@github.com:merlinND/ant-colony.git
cd ant-colony
npm install
pm2 start index.js
```

## Credits

- Ant spite & animation by DudeMan on [opengameart.org](https://opengameart.org/content/walking-ant-with-parts-and-rigged-spriter-file)
