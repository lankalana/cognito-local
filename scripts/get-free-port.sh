#!/bin/bash
BASE_PORT=49152
INCREMENT=1

port=$BASE_PORT

while [ -n "$(ss -tan4H "sport = $port")" ]; do
  port=$((port+INCREMENT))
done

echo "$port"