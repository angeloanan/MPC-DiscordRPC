module.exports = {
  apps : [
    {
      name        : 'mpc-discordrpc',
      script      : 'index.js',
      log         : 'mpc-discordrpc.log',
      output      : '\\\\.\\NUL',
      error       : '\\\\.\\NUL',
      merge_logs  : true
    }
  ]
};
