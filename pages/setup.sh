#!/usr/bin/env bash
test $(which pug) != ""
if $?
then
  echo no pug found
  exit 1
else
  echo pug found
fi

mkdir static 

pushd static
ln -s ../../connect/public/build ./connect
ln -s ../../phase-8/public ./phase-8
popd

pug  -w *.pug
