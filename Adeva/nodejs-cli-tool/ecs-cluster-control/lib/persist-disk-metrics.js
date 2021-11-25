'use strict';

/* eslint-disable no-console */

const opener = require('opener');

module.exports.run = (cli, context) => {

  const region = cli.flags.regions[0] || 'us-east-1';
  const accounts = cli.flags.accounts[0] || 'default';
  const stackName = cli.input[1];
  if (!stackName)
    return Promise.reject(new Error('Please provide name of the aws-ecs-autoscaling stack'));

  const ids = Object.keys(data.cache.Cluster.Instances);

  return Promise.resolve()
    .then(() => {
      return clusterState.getClusterState(region, cluster)
        .then((state) => {
          console.log(state);
        });
    }).then(() => {
      while (ids.length) {
        const before = `https://console.aws.amazon.com/cloudwatch/home?region=${region}#metricsV2:graph=~(view~'timeSeries~stacked~false~metrics~(`;
        const clusterWide = `~(~'System*2fLinux~'mnt/persistDiskUtilization~'AutoScalingGroupName~'${region}.${stackName}~(stat~'Maximum))`;
        const after = `)~region~'${region});search=mnt/persistDiskUtilization,${stackName};namespace=System/Linux;dimensions=InstanceId`;
        const instanceIds = ids.splice(0, 50).map((id) => `~(~'...~'InstanceId~'${id}-${stackName}-${region}~(stat~'Maximum))`).join('');
        opener(`${before}${clusterWide}${instanceIds}${after}`);
      }
    });
};
