'use strict';
const test = require('tape');
const sinon = require('sinon');
const pendingTasks = require('../lib/pending-tasks.js');
const cc = require('../commands/ecs-cluster-control.js');

test('[ecs-cluster-control] [run] [error]', (assert) => {
  const cli = { input: ['wrongCommand'] };
  const context = 'something';
  cc.run(cli, context)
    .catch((err) => {
      assert.equals(err, 'Command not valid, use --help for a list of valid ecs-cluster-control commands.');
    })
    .then(() => assert.end());
});

test('[ecs-cluster-control] [run] [success]', (assert) => {
  const cli = { input: ['pending-tasks'] };
  const context = 'something';
  sinon.stub(pendingTasks, 'run').returns(Promise.resolve('success'));
  cc.run(cli, context)
    .then((res) => { assert.equals(res, 'success', 'should be equal'); })
    .catch((err) => console.log(err))
    .then(() =>{
      pendingTasks.run.restore();
      assert.end();
    });
});
