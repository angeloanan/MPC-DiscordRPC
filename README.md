# MPC-DiscordRPC
Discord Rich Presence for Media Player Classic (Home Cinema and Black Edition)

![Media Player Classic Home Cinema and Black Edition Rich Presence on Discord small profile](https://i.imgur.com/QAAJZgL.png)

## How does this work?
This program simply fetches playback data from MPC-HC / MPC-BE Web Interface, and displays it in your Discord profile through their wonderful [Rich Presence](https://discordapp.com/rich-presence) API.

Please note that this only works with [Discord desktop client](https://discordapp.com/download), not with the web app.

## How to install
1. Open your Media Player Classic, go to `View > Options > Player > Web Interface` and enable `Listen on port:` option. The default port is `13579`, but if you have changed it, please edit the `config.js` file after you download the project.

![Enable the option "Listen on port"](https://cdn.discordapp.com/attachments/416273308540207116/428748994307424256/unknown.png)

2. Install [`Node.JS`](https://nodejs.org/en/download/current/) (we recommend using the latest version). Optional but better, also install [`Yarn`](https://yarnpkg.com/docs/install).

3. [Download this project as a .zip file](https://github.com/angeloanan/MPC-DiscordRPC/archive/master.zip), extract it and open a terminal window in the project directory. Otherwise, if you have [Git](https://git-scm.com/) installed, run:

```sh
git clone https://github.com/angeloanan/MPC-DiscordRPC.git && cd MPC-DiscordRPC
```

4. Install dependencies using: 
```sh
npm i
``` 

   If you prefer using Yarn, simply run:

```sh
yarn
```

> Note: You can safely ignore all peer and optional dependencies warnings as they are not required for the program to work.

5. Start the program using: 
```sh
npm start
``` 
or via
```sh
node index.js
``` 
Now you can close the terminal.

And voilà! It will now show in your Discord profile what you're watching/listening to on MPC.

If you need MPC-DiscordRPC to stop showing your playback info, just run:

```
npm stop
```

## How to update

1. Navigate to the directory where did you cloned / downloaded this project.

2. Stop the program using:

```sh
npm stop
```

3. Update this project by redownloading this project as a .zip file and replacing the old files. Otherwise, if you have Git installed, run:
```sh
git pull
```

4. Start the program again using:
```sh
npm start
```

Now you may close the terminal. The project is fully up to date!
