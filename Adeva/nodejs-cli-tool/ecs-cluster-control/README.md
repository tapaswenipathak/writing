# ecs-cluster-control

ecs-cluster-control is a command line tool for managing ECS clusters.


## Table of Contents
* [Installation](#installation)
* [Usage](#commands-usage)

## Installation

1. Clone the repository: `git clone git@github.com:tapaswenipathak/ecs-cluster-control`
2. Move to the root folder: `cd ecs-cluster-control`
3. Install dependencies: `npm install`
4. Move into the `commands` folder: `cd ecs-cluster-control/commands`
5. Register as an extension: `source extension register $(pwd)`
6. Run `source --help`. You should see `ecs-cluster-control` listed as a valid command
7. You would want to run `git pull origin master` to fetch recent changes as it
is under developement.

1. `help` command

   Run `ecs-cluster-control --help` or `ecs-cluster-control -h` to see the list of available commands.

2. `task-churn` command prints the total, min, avg, max tasks ended in last one hour
   in a cluster.

   Run `source ecs-cluster-control task-churn cluster-name --account account-name --region region-name`

   Sample output:
   ```
   name                count       min (s)   avg (s)   max (s)
   ----------------- ------------ ---------- --------- --------
   stack-name        total_count    min_sec  avg_sec   max_sec
   ```

3. `pending-tasks` command prints currently pending tasks on a cluster.

    Run `source ecs-cluster-control pending-tasks cluster-name --account account-name --region region-name`

    Sample output:

    ```
    pending task     host     duration(s)
    -------------  --------- -------------
    stack-name      host id   duration(s)
    ```

4.  `terminate-instance` is used to terminate an instance with a given instance id.

     Run `source ecs-cluster-control terminate-instance instance-id --account account-name --region region-name`


     Sample output:

     ```
     Terminating AutoScaling Instance instance-id
     ```
