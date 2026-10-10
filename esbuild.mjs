import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

const ctx = await esbuild.context({
  entryPoints: ['js/index.js'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/bundle.js',
});

if (watch) {
  await ctx.watch();
  console.log('watching…');
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
