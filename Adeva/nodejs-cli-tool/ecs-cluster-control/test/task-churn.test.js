'use strict';

const tape = require('tape');
const AWS = require('mock-aws-sdk-js');
const taskchurn = require('../lib/task-churn.js');
const sinon = require('sinon');
const Table = require('easy-table');

tape('Test taskchurn', function(assert) {
  var clusterName = 'production';
  var expectedTaskArns = [
    'arn:aws:ecs:us-east-1:234858372212:task/11e09de9-7cea-4d8f-b319-eeb37b47908e',
    'arn:aws:ecs:us-east-1:234858372212:task/35990d4c-fe0e-454c-aeb9-f1be314a07b7',
    'arn:aws:ecs:us-east-1:234858372212:task/4802c330-bc25-4566-abc4-c1c86822e3f3',
    'arn:aws:ecs:us-east-1:234858372212:task/52257804-19a7-4612-ad47-01459105ddce',
    'arn:aws:ecs:us-east-1:234858372212:task/94904ea7-fa0d-4928-bfeb-48f8dd24ff1b',
    'arn:aws:ecs:us-east-1:234858372212:task/a9c3a314-6083-432f-a351-19995833ac48',
    'arn:aws:ecs:us-east-1:234858372212:task/b101908e-f3df-4096-b4b5-6c00206537f8',
    'arn:aws:ecs:us-east-1:234858372212:task/c80a46cd-8c5a-4c8e-ae41-c9da07d1cded',
    'arn:aws:ecs:us-east-1:234858372212:task/cbc831d4-8b37-45d7-9a82-05c8cea9e0fb',
    'arn:aws:ecs:us-east-1:234858372212:task/e9218949-b629-4597-9d0a-f54bd4c425b4'
  ];


  var expectedTaskDescriptions = [
    {
      taskDefinitionArn: 'arn:aws:ecs:us-east-1:234858372212:task-definition/valhalla-svc-route-production_directions_cogs:56',
      startedAt: '2018-03-25T04:24:53.722Z',
      stoppedAt: '2018-03-25T12:16:28.946Z'
    },
    {
      taskDefinitionArn: 'arn:aws:ecs:us-east-1:234858372212:task-definition/valhalla-svc-route-production_directions_cogs:57',
      startedAt: '2018-03-25T12:02:19.207Z',
      stoppedAt: '2018-03-25T12:24:19.101Z'
    },
    {
      taskDefinitionArn: 'arn:aws:ecs:us-east-1:234858372212:task-definition/valhalla-svc-route-production_directions_cogs:57',
      startedAt: '2018-03-25T12:02:03.188Z',
      stoppedAt: '2018-03-25T12:33:16.627Z'
    },
    {
      taskDefinitionArn: 'arn:aws:ecs:us-east-1:234858372212:task-definition/valhalla-svc-route-production_directions_cogs:56',
      startedAt: '2018-03-25T04:18:44.723Z',
      stoppedAt: '2018-03-25T12:16:39.928Z'
    },
    {
      taskDefinitionArn: 'arn:aws:ecs:us-east-1:234858372212:task-definition/valhalla-data-production_directions_cogs:5',
      startedAt: '2018-03-24T19:53:58.300Z',
      stoppedAt: '2018-03-25T11:58:38.362Z'
    },
    {
      taskDefinitionArn: 'arn:aws:ecs:us-east-1:234858372212:task-definition/valhalla-svc-route-production_directions_cogs:57',
      startedAt: '2018-03-25T12:02:17.599Z',
      stoppedAt: '2018-03-25T12:27:16.787Z'

    },
    {
      taskDefinitionArn: 'arn:aws:ecs:us-east-1:234858372212:task-definition/valhalla-svc-route-production_directions_cogs:57',
      startedAt: '2018-03-25T12:08:30.293Z',
      stoppedAt: '2018-03-25T12:21:13.332Z'
    },
    {
      taskDefinitionArn: 'arn:aws:ecs:us-east-1:234858372212:task-definition/valhalla-svc-route-production_directions_cogs:57',
      startedAt: '2018-03-25T12:08:42.722Z',
      stoppedAt: '2018-03-25T12:18:11.781Z'
    },
    {
      taskDefinitionArn: 'arn:aws:ecs:us-east-1:234858372212:task-definition/valhalla-svc-route-production_directions_cogs:56',
      startedAt: '2018-03-25T04:24:52.466Z',
      stoppedAt: '2018-03-25T12:16:37.161Z'
    },
    {
      taskDefinitionArn: 'arn:aws:ecs:us-east-1:234858372212:task-definition/valhalla-svc-route-production_directions_cogs:57',
      startedAt: '2018-03-25T12:08:32.715Z',
      stoppedAt: '2018-03-25T12:30:12.867Z'
    },

  ];

  const listTasks = AWS.stub('ECS', 'listTasks',
    function() {
      this.request.eachPage = function(callback) {
        callback(null, { taskArns: expectedTaskArns }, function(){
          callback();
        });
      };
    });

  const describeTasks = AWS.stub('ECS', 'describeTasks', function() {
    const response = {
      tasks: expectedTaskDescriptions
    };

    this.request.promise.returns(Promise.resolve(response));
  });

  const context = {
    access: {
      getClient: sinon.stub().returns(Promise.resolve(new AWS.ECS()))
    }
  };

  const cli = {
    input: ['task-churn', 'production'],
    flags: {
      accounts: ['default'],
      regions: ['us-east-1']
    }
  };

  const result = Table.print([
    {
      name: 'sample-route-production_cogs',
      count: 9,
      'min (s)': 570,
      'avg (s)': 10289,
      'max (s)': 28676
    },
    {
      name: 'sample-data-production_cogs',
      count: 1,
      'min (s)': 57881,
      'avg (s)': 57881,
      'max (s)': 57881
    }
  ]);

  sinon.spy(console, 'log');
  taskchurn.run(cli, context)
    .then(() => {
      assert.equal(console.log.callCount, 1, 'console.log called once');
      assert.ok(console.log.calledWith(result), 'console.log called with expected params');

      assert.equal(listTasks.callCount, 1, 'listTasks was called once');
      assert.ok(listTasks.calledWith({
        cluster: 'production',
        desiredStatus: 'STOPPED'
      }), 'listTasks was called with the right arguments');
      assert.equal(describeTasks.callCount, 1, 'describeTasks was called once');
      assert.ok(describeTasks.calledWith({ cluster: clusterName, tasks: expectedTaskArns }), 'describeTasks was called with expected arguments');
      assert.ok(context.access.getClient.calledWith('ECS', 'default', {
        region: 'us-east-1'
      }),
      'created ECS Object in the default account');
    })
    .catch((err) => assert.ifError(err, 'failed'))
    .then(() => {
      AWS.ECS.restore();
      console.log.restore();
      assert.end();
    });
});
