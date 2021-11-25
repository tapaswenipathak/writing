#!/usr/bin/env node

/* eslint-disable no-console */

var meow = require('meow');

var cli = meow({
  help: `
    USAGE: ecs-cluster-control <command> [OPTIONS]

    Commands:
      get-capacity          print spot fleet capacity information
      set-capacity          adjust the spot fleet's target capacity
      terminate-instance    gracefully shut down a single EC2
      teardown              gracefully delete an ecs-cluster stack
      scaling-activity      print recent spot fleet scaling activity
      fleet-events          print spot fleet event history
      instance-balance      print a table of instance type / region distribution
      docker-disk-metrics   open CloudWatch metrics for docker disk utilization
      persist-disk-metrics  open CloudWatch metrics for persistent disk utilization
      pending-metrics       open CloudWatch metrics for pending tasks per instance
      metric-offenders      find cluster instance max from the last 10 min for any System/Linux metric
      task-churn            print min/avg/max durations for tasks stopped in the last hour
      disable-scaledown     disables the scale-down schedule rule and error alarm actions
      enable-scaledown      enables the scale-down schedule rule and error alarm actions
      worker-capacity       calculates how many service tasks can be placed on cluster at current capacity

    Options:
      -h,  --help            show this help message
      -r,  --region          the region the cluster is in
      -cl, --cluster-name    the cluster name, e.g. production
      -c,  --capacity        the desired spot fleet target capacity
      -i,  --instance-id     an EC2 instance id
      -a,  --app-name        the application's service name on the cluster
      -m,  --me              your slack handle, e.g. '@rclark'
      --metric-name          the MetricName for a System/Linux metric
  `,
  description: 'Helper utilities for interacting with AWS ECS clusters'
}, {
  alias: {
    r: 'region',
    cl: 'cluster-name',
    c: 'capacity',
    i: 'instance-id',
    a: 'app-name',
    m: 'me'
  },
  string: ['region', 'cluster-name', 'instance-id', 'me'],
  number: ['capacity']
});

var command = cli.input[0];
var fn;
try { fn = require(`../lib/${command}`); }
catch(err) {
  console.error(err.message);
  cli.showHelp(1);
}

const preamble = cli.flags.region && cli.flags.clusterName ?
  require('../lib/cluster-info.js') : () => Promise.resolve();

preamble(cli.flags)
  .then((info) => fn(cli.flags, info))
  .catch((err) => {
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
  });
