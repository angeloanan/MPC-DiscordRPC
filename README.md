# MPC-HC-DiscordRPC
Discord Rich Presence for Media Player Classic - Home Cinema

![Media Player Classic Rich Presence on Discord small profile](https://cdn.discordapp.com/attachments/416273308540207116/428741647153758210/unknown.png)

## How does this work?
This program simply fetches playback data from MPC-HC Web Interface, makes it look nicer and displays it in your Discord profile through their wonderful [Rich Presence](https://discordapp.com/rich-presence). 

Please note that it only works with [Discord desktop client](https://discordapp.com/download), not with the website.

## How to install
1. Open Media Player Classic, go to `View > Options > Player > Web Interface` and enable `Listen on port:` option. The default port is `13579`, but if you have changed it, please edit the `config.js` file after you download the project.
![Enable the option "Listen on port"](https://cdn.discordapp.com/attachments/416273308540207116/428748994307424256/unknown.png)
2. Install [`Node.JS`](https://nodejs.org/en/download/current/) (we recommend using the latest version). Optional but better, also install [`Yarn`](https://yarnpkg.com/docs/install).
3. Download this project as a .zip file, extract it and open a terminal window in the project directory. Otherwise, if you have [Git](https://git-scm.com/) installed, run:

```sh
git clone https://github.com/angeloanan/MPC-HC-DiscordRPC.git && cd MPC-HC-DiscordRPC
```

4. Install dependencies using: 
```sh
npm i && npm i -g forever
``` 

If you prefer using Yarn, run:

```sh
yarn && yarn global add forever
```

5. Start the program using: 
```sh
forever start -s .
``` 
Now you can close the terminal.

And voilà! It will now show in your Discord profile what you're watching/listening to on MPC-HC. Enjoy.

## How to update

1. Navigate to the directory where did you cloned / downloaded this project.

2. Stop the program using:

```sh
forever stop .
```

3. Update this project by redownloading this project as a .zip file and replacing the old files. Otherwise, if you have Git installed, run:
```sh
git pull
```

4. Start the program again using:
```sh
forever start -s .
```

Now you may close the terminal. The project is fully up to date!