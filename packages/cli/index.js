require('yargs') // eslint-disable-line
  .command(
    'publish [lambdaName]',
    'publish the given lambda',
    (yargs) => {
      yargs.positional('lambdaName', {
        describe: 'lambda to publish',
        default: undefined,
      })
      yargs.option('clean-all', {
        describe: 'clean all files (npm residuals, etc)',
        boolean: true,
        default: false,
      })
    },
    (argv) => require('./publish')(argv).catch((ex) => console.error(ex)),
  ).argv
