#!/bin/bash
set -x

args=("$@")
augur_env=${args[0]}
version=$(date -u +%Y-%m-%d-%H%M)
build_environment="dev"

aws_preconfigure () {
    # we need aws cli tools to deploy
    python --version
    sudo apt-get install libssl-dev python-pyasn1 python3-pyasn1
    sudo pip install awscli
}

aws_deploy () {
    aws --region=us-east-1 ecs update-service  --service "$augur_service" --cluster "${cluster}" --force-new-deployment
}

case ${augur_env} in
    dev)
        network="rinkeby"
        cluster="dev-augur-net"
        augur_service="dev-augur-ui"
        ;;
    stable)
        network="stable"
        cluster="stable-augur-net"
        augur_service="stable-augur-ui"
        ;;
    kovan)
        network="kovan"
        cluster="kovan-augur-net"
        augur_service="kovan-augur-ui"
        ;;
    dev-optimized)
        network="rinkeby"
        cluster="try-augur-net"
        augur_service="try-augur-ui"
        build_environment="dev-optimized"
        ;;
    sneakpeak)
        network="rinkeby"
        cluster="sneakpeak-augur-net"
        augur_service="sneakpeak-ui"
        ;;
    release)
        network="rinkeby"
        cluster=""
        augur_service=""
        build_environment="release"
        version = "$(node scripts/get-version.js)"
        ;;
    *)
        network=${augur_env}
        ;;
esac

#curl -v -LO https://nodejs.org/download/release/v10.15.0/node-v10.15.0-headers.tar.gz
find /opt/hostedtoolcache/node
#export npm_config_nodedir=/opt/hostedtoolcache/node/10.15.3/x64
export npm_config_nodedir=/Users/jph/.node-gyp/10.15.1
export npm_config_silly

docker build . --build-arg ethereum_network=${network} --build-arg build_environment=${build_environment} --tag augurproject/augur:${augur_env} --tag augurproject/augur:$version || exit 1

docker push augurproject/augur:$version
docker push augurproject/augur:${augur_env}

# install packages needed to deploy to aws, then deploy
if [[ -n "$cluster" ]]; then
    echo "deploy";
    aws_preconfigure
    aws_deploy
else
    echo "no deploy";
fi
