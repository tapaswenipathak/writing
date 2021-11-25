'use strict';

const tape = require('tape');
const AWS = require('mock-aws-sdk-js');
const pendingtasks = require('../lib/pending-tasks.js');
const sinon = require('sinon');
const Table = require('easy-table');
const clusterState = require('ecs-monitors');
const clock = sinon.useFakeTimers(1522633071538);

tape('Test pendingtasks', function(assert) {
  var clusterName = 'staging';

  const stateData = {
    Instances: {
      'i-086754b1b84fdbc3d': {
        info: {
          Tags: [{}]
        },
        clusterInfo: {
          containerInstanceArn: 'arn:aws:ecs:us-east-1:234858372212:container-instance/c5186550-7f7b-4005-a791-fbe65d829d91'
        }
      },
      'i-07ff25d6fcb127a01': {
        info: {
          Tags: [{}]
        },
        clusterInfo: {
          containerInstanceArn: 'arn:aws:ecs:us-east-1:234858372212:container-instance/c8078ca0-a47a-43b5-a582-736edace5658'
        }
      },
      'i-055cc26857986c4f3': {
        info: {
          Tags: [{}]
        },
        clusterInfo: {
          containerInstanceArn: 'arn:aws:ecs:us-east-1:234858372212:container-instance/f0190fdb-2dca-46dc-9e00-3813a06f1fb9'
        }
      },
      'i-09832921d1bd1bc15': {
        info: {
          Tags: [{}]
        },
        clusterInfo: {
          containerInstanceArn: 'arn:aws:ecs:us-east-1:234858372212:container-instance/f0bf8b0c-0ea6-4b1f-bce0-00509b21a0f5'
        }
      },
      'i-02fb14abda8370659': {
        info: {
          Tags: [{}]
        },
        clusterInfo: {
          containerInstanceArn: 'arn:aws:ecs:us-east-1:234858372212:container-instance/f4f3b804-f3b9-4ca5-94b8-f2ec8ca28034'
        }
      }
    }
  };
  const getClusterState = sinon.stub(clusterState, 'getClusterState').callsFake(() => {
    return Promise.resolve(stateData);
  });

  var expectedTaskArns = [
    'arn:aws:ecs:us-east-1:234858372212:task/02468e41-1202-4d62-8ca7-c70d5825da7d',
    'arn:aws:ecs:us-east-1:234858372212:task/0282291a-c62c-4a2f-b5ed-23e8dbc07708',
    'arn:aws:ecs:us-east-1:234858372212:task/0307292f-94e0-4f4d-9c07-bdd2e1d8d0f1',
    'arn:aws:ecs:us-east-1:234858372212:task/032b9331-daa3-414e-9084-e089119784ce',
    'arn:aws:ecs:us-east-1:234858372212:task/045fa355-17ee-46be-9413-4fce4ac5321f',
    'arn:aws:ecs:us-east-1:234858372212:task/07483469-9b2d-4155-a820-6a5feadea2ab',
    'arn:aws:ecs:us-east-1:234858372212:task/0b5ff18a-4d32-4cfc-b59b-6e84ef5e1551',
    'arn:aws:ecs:us-east-1:234858372212:task/0d051671-b393-46bb-809b-88f04cbb23b1',
    'arn:aws:ecs:us-east-1:234858372212:task/0d5da0cf-9168-40b9-b7db-5d1176178d68',
    'arn:aws:ecs:us-east-1:234858372212:task/0e362b95-b5d4-4f64-94a6-347f1632d755',
    'arn:aws:ecs:us-east-1:234858372212:task/11786957-7114-4915-b12b-fc906aae165c',
    'arn:aws:ecs:us-east-1:234858372212:task/e12938f3-118b-4ff0-a90b-78f7bc512ed2',
    'arn:aws:ecs:us-east-1:234858372212:task/e43b67b5-dff7-4f41-b92c-8f4879957d05',
    'arn:aws:ecs:us-east-1:234858372212:task/e4b2e7e3-7438-4b63-9d1c-07417f778548',
    'arn:aws:ecs:us-east-1:234858372212:task/e75eec79-3a20-49a3-af68-4a2ed6e402ff'
  ];

  var expectedTaskDescriptions = [
    {
      taskDefinitionArn: 'arn:aws:ecs:us-east-1:234858372212:task-definition/sample-data_rd:5',
      containerInstanceArn: 'arn:aws:ecs:us-east-1:234858372212:container-instance/f4f3b804-f3b9-4ca5-94b8-f2ec8ca28034',
      lastStatus: 'PENDING',
      createdAt: '2018-03-24T16:56:27.420Z'
    },
    {
      taskDefinitionArn: 'arn:aws:ecs:us-east-1:234858372212:task-definition/sample-staging_rd:25',
      containerInstanceArn: 'arn:aws:ecs:us-east-1:234858372212:container-instance/f4f3b804-f3b9-4ca5-94b8-f2ec8ca28034',
      lastStatus: 'PENDING',
      createdAt: '2018-03-24T12:18:05.311Z'
    },
    {
      taskDefinitionArn: 'arn:aws:ecs:us-east-1:234858372212:task-definition/sample-staging_rd:30',
      containerInstanceArn: 'arn:aws:ecs:us-east-1:234858372212:container-instance/f4f3b804-f3b9-4ca5-94b8-f2ec8ca28034',
      lastStatus: 'PENDING',
      createdAt: '2018-03-24T11:39:12.748Z'
    },
    {
      taskDefinitionArn: 'arn:aws:ecs:us-east-1:234858372212:task-definition/sample-staging_rd:10',
      containerInstanceArn: 'arn:aws:ecs:us-east-1:234858372212:container-instance/f4f3b804-f3b9-4ca5-94b8-f2ec8ca28034',
      lastStatus: 'PENDING',
      createdAt: '2018-03-24T11:07:03.165Z',
    },
  ];

  const listTasks = AWS.stub('ECS', 'listTasks',
    function() {
      this.request.eachPage = function(callback) {
        callback(null, { taskArns: expectedTaskArns }, function() {
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
    input: ['pending-tasks', 'staging'],
    flags: {
      accounts: ['default'],
      regions: ['us-east-1']
    }
  };

  const result = [
    {
      'pending task': 'sample-production_community_rd:5',
      host: 'i-02fb14abda8370659',
      duration: '636004s'
    },
    {
      'pending task': 'sample-production_community_rd:3',
      host: 'i-02fb14abda8370659',
      duration: '642174s'
    },
    {
      'pending task': 'sample-staging_cartography_rd:20',
      host: 'i-02fb14abda8370659',
      duration: '661328s'
    },
  ];

  sinon.spy(console, 'log');
  pendingtasks.run(cli, context)
    .then(() => {
      assert.equal(console.log.callCount, 1, 'console.log was called once');
      //assert.ok(console.log.args[0][0], Table.print(result), 'console.log called with correct params');
      assert.ok(console.log.args[0], [Table.print(result)], 'console.log called with correct params');
      assert.equal(getClusterState.callCount, 1, 'calls getClusterState');
      assert.deepEqual(getClusterState.args[0], ['us-east-1', 'staging'], 'getClusterState was called with expected arguments');
      assert.equal(listTasks.callCount, 1, 'listTasks was called once');
      assert.ok(listTasks.calledWith({
        cluster: 'staging'
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
      clusterState.getClusterState.restore();
      clock.restore();
      assert.end();
    });
});
