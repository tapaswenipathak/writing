'use strict';
const fs = require('fs');
const path = require('path');

/**
 * Description of ecs-cluster-control commands to be used in registration with mbxcli.
 */
module.exports.configuration = {
  description: 'Helper utilities for interacting with AWS ECS clusters',
  help: `
    USAGE: source ecs-cluster-control <command> [OPTIONS]
    command:
      task-churn                  print min/avg/max durations for tasks stopped in the last hour
      terminate-instance          gracefully terminates the specified instance
      pending-tasks               giveb a cluster name and region print currently pending tasks.
    Options:
      -a,  --account              [default] a comma-delimited list of accounts
                                  to create the stack in
      -r,  --region               [us-east-1] a comma-delimited list of regions
                                  to create the stack in
      -h,  --help                 shows this help message
  `
};


/**
 * Function called when command is run through source cli tool.
 * @param  {object} cli     parsed command-line arguments
 * @param  {object} context information about the context in which the command was requested
 */
module.exports.run = (cli, context) => {
  const command = cli.input[0];
  const files = fs.readdirSync(path.resolve(__dirname, '..', 'lib'));
  const commands = new Set(files.map((filename) => filename.replace('.js', '')));

  //check if command corresponds with a file in ./lib
  const valid = commands.has(command);

  if(valid){
    const run = require(`../lib/${command}.js`).run;
    return run(cli, context);
  } else {
    return Promise.resolve()
      .then(() => { console.log(`Command ${cli.input[0]} not valid`); });
  }
};
