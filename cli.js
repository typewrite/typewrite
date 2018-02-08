#!/usr/bin/env node
const program = require('commander');
const { prompt } = require('inquirer');
const bcrypt = require('bcryptjs');
const fileReplace = require('replace-in-file');
const chalk = require('chalk');
const path = require('path');

program.version('v1.0.0')
    .name('nb')
    .description('Node Blogger App Command Line Tools');

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
    .description('Install Typewrite, dependencies et al.')
    .action(() => {
        // Install all dependencies.

        // Check Database Installation and Setup the same with tables and db.

        // Check ssl install and availability of Keys. (esp. in prod)
    })
    
program.parse(process.argv);