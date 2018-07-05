<div id="table-of-contents">
<h2>Table of Contents</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. Walltime CLI - Walltime Command Line Interface</a>
<ul>
<li><a href="#sec-1-1">1.1. Installation</a></li>
<li><a href="#sec-1-2">1.2. Help</a></li>
</ul>
</li>
</ul>
</div>
</div>

# Walltime CLI - Walltime Command Line Interface<a id="sec-1" name="sec-1"></a>

## Installation<a id="sec-1-1" name="sec-1-1"></a>

    sudo apt-get install nodejs npm
    npm install walltime-cli -g

## Help<a id="sec-1-2" name="sec-1-2"></a>

    ➜ walltime
    
      Usage:  [-tvj] <command> [-h|<args>]
    
      Walltime CLI is the Walltime Digital Assets Exchange Command Line Interface. With this app, you can easily retrieve market info and manipulate your account.
    
      Options:
    
        -V, --version                            output the version number
        -t, --testnet                            use testnet
        -v, --verbose                            verbose mode
        -j, --json                               return in json format when possible
        -p, --path <dbpath>                      the database path, default is ~/.walltime
        -h, --help                               output usage information
    
      Commands:
    
        init [options]                           Build new credentials.
        setup <useruuid>                         Setup your user UUID.
        show [options]                           Show your credentials (for backup).
        restore [options] <wifprivkey>           Restore credentials from backup.
        info [field]                             Retrieve general market info.
        trades [year_month_day_hour|iso8601]     Retrieve global last trades of a given interval of hour (UTC).
        orderbook [options] [page]               Retrieve order book information.
        accountinfo                              Retrieve user account basic info.
        follow <nonce>                           Wait an answer in the nonce.
        getorders                                Retrieve information about orders.
        newaddress [bech32] [currency] [amount]  Generate a new crypto deposit address.
        addaddress <address> <currency> [label]  Add a new crypto exit address.
        trycancelorder <orderid>                 Try to cancel an order.
    
    The following commands, use walltime <command> -h to see more details:
    
        accountstatement
        addbankaccount
        createorder
        informdeposit
        withdraw
    
    Use walltime <command> -h to see more info about each command.
    ➜ $WT_SECRET is set, remember to cleanup this later.
