# Discord Rich Presence for MPC-HC [WORK IN PROGRESS]
Discord Rich Presence for Media Player Classic - Home Cinema

![Media Player Classic Rich Presence on profile small menu](https://cdn.discordapp.com/attachments/416273308540207116/428004439538794496/unknown.png)

## How does this work?
This program simply fetches playback data from MPC-HC Web Interface, makes it look nicer and displays it in your Discord profile using their wonderful [Rich Presence](https://discordapp.com/rich-presence).

## How to install
1. Open Media Player Classic and go to `View > Options > Player > Web Interface` and enable `Listen on port:` option. Make sure port number is `13579` (it's the default port for MPC-HC web interface).
![Enable the option "Listen on port"](https://cdn.discordapp.com/attachments/416273308540207116/428009583588540436/unknown.png)
2. Install `Node.JS` (optional but better, also install `Yarn`).
3. Clone this repository by running on the terminal: `git clone https://github.com/angeloanan/MPC-HC-DiscordRPC.git`
4. Change to the project directory using `cd MPC-HC-DiscordRPC`
5. Do `npm i` (Yarn user: `yarn install`)
6. Also do `npm i -g forever` (Yarn user: `yarn global add forever`)
7. Do `forever start .` and close the terminal.

And voilà! The module will now show what you're watching on MPC-HC in your Discord profile.

To stop MPC-HC Rich Presence, open a terminal window and enter `forever stopall`.
