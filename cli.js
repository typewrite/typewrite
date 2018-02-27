#!/usr/bin/env node
const { exec } = require('child_process');
var program = require('commander');
var { prompt } = require('inquirer');
var bcrypt = require('bcryptjs');
var fileReplace = require('replace-in-file');
var chalk = require('chalk');
var path = require('path');
var shell = require('shelljs');
var debug = require('debug');
const defaultHandler = (err, stdout, stderr) => {
    if (err) {
        console.log(`FATAL: ${err}`);
        return;
    }
    console.log(chalk.red(`stdout: ${stdout}`));
    console.log(chalk.green(`stderr: ${stderr}`));
}

program.version('v1.0.0')
    .name('typewrite')
    .description('TypeWrite Command Line Tools');

program.command('key:generate')
    .alias('keygen')
    .description('Generate new Key and set it as environment APP_KEY in .env file')
    .action(() => {
        let token = new Buffer(bcrypt.genSaltSync(12)).toString('base64');
        
        fileReplace({
            disableGlobs: true,
            files: '.env',
            from: 'APP_KEY=null',
            to: 'APP_ENV=' + token
        })
        .then((changes) => {
            console.log(chalk.green('Key: ' + token + ' generated!'));
        })
        .catch((err) => {
            console.log(chalk.red(err));
        });
    });

program.command('install')
    .alias('i')
    .description('Install TypeWrite, dependencies et al.')
    .action(() => {
        // Install all dependencies.

        // Check Database Installation and Setup the same with tables and db.

        // Check ssl install and availability of Keys. (esp. in prod)
    });

    
program.parse(process.argv);