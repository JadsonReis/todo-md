'use strict';

/* global it, describe */

var path = require('path');
var mkdirp = require('mkdirp');

var nixt = require('nixt');

describe('todo bin', function () {
  var cmd = [path.join(__dirname, '../bin/todo'), ''];

  if (process.platform === 'win32') {
    cmd.unshift('"' + process.execPath + '"');
  }

  var tempPath = path.join(__dirname, 'temp');
  var todofile = path.join(tempPath, 'todo.md');

  mkdirp(tempPath);

  var baseText = ['# Heading',
                  '',
                  '- [ ] Line 3',
                  '  - [x] Line 4',
                  '- [ ] Line 5',
                  '- [x] Line 6'
                ].join('\n');

  function cli () {
    return nixt({colors: false})
      .timeout(8000)
      .cwd(tempPath)
      .base(cmd.join(' '))
      .writeFile(todofile, baseText);
  }

  it('should list when missing command', function (done) {
    cli()
      .run('')
      .stdout(/# Heading/)
      .stdout(/ {3}3 \| - \[ \] Line 3/)
      .stdout(/ {3}4 \| {3}- \[x\] Line 4/)
      .stdout(/ {3}5 \| - \[ \] Line 5/)
      .stdout(/ {3}6 \| - \[x\] Line 6/)
      .match(todofile, baseText)
      .stderr('')
      .code(0)
      .end(done);
  });

  it('should print', function (done) {
    cli()
      .run('print')
      .stdout(baseText + '\n')
      .stderr('')
      .code(0)
      .end(done);
  });

  it('should print status', function (done) {
    cli()
      .run('status')
      .stdout(/4 tasks, 2 done, 2 pending in/)
      .stderr('')
      .code(0)
      .end(done);
  });

  it('should add on unknown command', function (done) {
    cli()
      .run('"New"')
      .stdout(/ {3}3 \| - \[ \] Line 3/)
      .stdout(/ {3}4 \| {3}- \[x\] Line 4/)
      .stdout(/ {3}5 \| - \[ \] Line 5/)
      .stdout(/ {3}6 \| - \[x\] Line 6/)
      .stdout(/ {3}7 \| - \[ \] New/)
      .stderr('')
      .code(0)
      .end(done);
  });

  it('should return an error on unknown option', function (done) {
    cli()
      .run('--unknown')
      .stdout('')
      // .stderr('')  // Not consitant between dos and bash
      .code(1)
      .end(done);
  });

  it('should add a new task', function (done) {
    cli()
      .run('add "New"')
      .stdout(/ {3}3 \| - \[ \] Line 3/)
      .stdout(/ {3}4 \| {3}- \[x\] Line 4/)
      .stdout(/ {3}5 \| - \[ \] Line 5/)
      .stdout(/ {3}6 \| - \[x\] Line 6/)
      .stdout(/ {3}7 \| - \[ \] New/)
      .stderr('')
      .code(0)
      .end(done);
  });

  it('should add a new task, with done flag', function (done) {
    cli()
      .run('add "New" --done')
      .stdout(/ {3}3 \| - \[ \] Line 3/)
      .stdout(/ {3}4 \| {3}- \[x\] Line 4/)
      .stdout(/ {3}5 \| - \[ \] Line 5/)
      .stdout(/ {3}6 \| - \[x\] Line 6/)
      .stdout(/ {3}7 \| - \[x\] New/)
      .stderr('')
      .code(0)
      .end(done);
  });

  it('should add a new task with index', function (done) {
    cli()
      .run('add "New" 6')
      .stdout(/ {3}3 \| - \[ \] Line 3/)
      .stdout(/ {3}4 \| {3}- \[x\] Line 4/)
      .stdout(/ {3}5 \| - \[ \] Line 5/)
      .stdout(/ {3}6 \| - \[ \] New/)
      .stdout(/ {3}7 \| - \[x\] Line 6/)
      .stderr('')
      .code(0)
      .end(done);
  });

  it('should add a new task with index, with proper indent', function (done) {
    cli()
      .run('add "New" 5')
      .stdout(/ {3}3 \| - \[ \] Line 3/)
      .stdout(/ {3}4 \| {3}- \[x\] Line 4/)
      .stdout(/ {3}5 \| {3}- \[ \] New/)
      .stdout(/ {3}6 \| - \[ \] Line 5/)
      .stdout(/ {3}7 \| - \[x\] Line 6/)
      .stderr('')
      .code(0)
      .end(done);
  });

  it('should add a new task with index, with indent', function (done) {
    cli()
      .run('add "New" -I')
      .stdout(/ {3}3 \| - \[ \] Line 3/)
      .stdout(/ {3}4 \| {3}- \[x\] Line 4/)
      .stdout(/ {3}5 \| - \[ \] Line 5/)
      .stdout(/ {3}6 \| - \[x\] Line 6/)
      .stdout(/ {3}7 \| {3}- \[ \] New/)
      .stderr('')
      .code(0)
      .end(done);
  });

  it('should add a new task with index, with explicit indent', function (done) {
    cli()
      .run('add "New" --indent 2')
      .stdout(/ {3}3 \| - \[ \] Line 3/)
      .stdout(/ {3}4 \| {3}- \[x\] Line 4/)
      .stdout(/ {3}5 \| - \[ \] Line 5/)
      .stdout(/ {3}6 \| - \[x\] Line 6/)
      .stdout(/ {3}7 \| {5}- \[ \] New/)
      .stderr('')
      .code(0)
      .end(done);
  });

  it('should indent a task', function (done) {
    cli()
      .run('indent 3-4,6 1')
      .stdout(/# Heading/)
      .stdout(/ {3}3 \| {3}- \[ \] Line 3/)
      .stdout(/ {3}4 \| {5}- \[x\] Line 4/)
      .stdout(/ {3}5 \| - \[ \] Line 5/)
      .stdout(/ {3}6 \| {3}- \[x\] Line 6/)
      .stderr('')
      .code(0)
      .end(done);
  });

  it('should unindent a task', function (done) {
    cli()
      .run('unindent 4 1')
      .stdout(/ {3}3 \| - \[ \] Line 3/)
      .stdout(/ {3}4 \| - \[x\] Line 4/)
      .stdout(/ {3}5 \| - \[ \] Line 5/)
      .stdout(/ {3}6 \| - \[x\] Line 6/)
      .stderr('')
      .code(0)
      .end(done);
  });

  it('should mark a task', function (done) {
    cli()
      .run('do 3-4,6')
      .stdout(/ {3}3 \| - \[x\] Line 3/)
      .stdout(/ {3}4 \| {3}- \[x\] Line 4/)
      .stdout(/ {3}5 \| - \[ \] Line 5/)
      .stdout(/ {3}6 \| - \[x\] Line 6/)
      .stderr('')
      .code(0)
      .end(done);
  });

  it('should unmark a task', function (done) {
    cli()
      .run('undo 3-4,5')
      .stdout(/ {3}3 \| - \[ \] Line 3/)
      .stdout(/ {3}4 \| {3}- \[ \] Line 4/)
      .stdout(/ {3}5 \| - \[ \] Line 5/)
      .stdout(/ {3}6 \| - \[x\] Line 6/)
      .stderr('')
      .code(0)
      .end(done);
  });

  it('should remove a task', function (done) {
    cli()
      .run('rm 5,3')
      .stdout(/ {3}3 \| {3}- \[x\] Line 4/)
      .stdout(/ {3}4 \| - \[x\] Line 6/)
      .stderr('')
      .code(0)
      .end(done);
  });

  it('should move tasks', function (done) {
    cli()
      .run('mv 3 5')
      .stdout(/ {3}3 \| {3}- \[x\] Line 4/)
      .stdout(/ {3}4 \| - \[ \] Line 5/)
      .stdout(/ {3}5 \| - \[ \] Line 3/)
      .stdout(/ {3}6 \| - \[x\] Line 6/)
      .stderr('')
      .code(0)
      .end(done);
  });

  it('should accept -q', function (done) {
    cli()
      .run('do 100 -q')
      .stdout('')
      .stderr('')
      .code(0)
      .end(done);
  });
});
