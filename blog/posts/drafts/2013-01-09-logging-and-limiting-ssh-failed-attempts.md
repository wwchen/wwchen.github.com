---
layout: post
title: "Logging and limiting SSH failed attempts"
description: ""
category: 
tags: []
---
{% include JB/setup %}

# Backstory
I get relentless bots trying to gain access to my machine via SSH daily. Shouldn't they have learned after the 100th attempt that I don't permit root SSH login?? Anyway..

I've been a fan of DenyHost (and actually my friend Kyle Willmon is the Debian package maintainer for [it](http://packages.qa.debian.org/d/denyhosts.html)),
but with my new machine, I decided to try a different approach. Instead of blacklisting IPs, I'm going to rate-limit connections with `iptables`.

## Limiting SSH connections
[ref](http://hostingfu.com/article/ssh-dictionary-attack-prevention-with-iptables)

Assuming you allow three password attempts per connection, each has a login grace period of one minute, one connection could drag on for three minutes.
You want to adjust the number of connections and timeframe accordingly. I would suggest 3 connections, and a lockout period of more than five minutes.
    iptables -N SSH_CHECK
    iptables -A INPUT -p tcp --dport 22 -m state --state NEW -j SSH_CHECK
    iptables -A SSH_CHECK -m recent --set --name SSH
    iptables -A SSH_CHECK -m recent --update --seconds 300 --hitcount 4 --name SSH -j DROP
This creates a chain called SSH_CHECK, and any new connections to port 22 gets routed there. The condition for dropping the connection is any more than 4 connections within 300 seconds.



## Logging passwords on SSH failed attempts
[ref](http://www.adeptus-mechanicus.com/codex/logsshp/logsshp.html)
When I see a billion of
    Jan  9 04:11:09 albus sshd[24081]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=183.61.135.224  user=root
    Jan  9 04:11:30 albus sshd[24104]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=183.61.135.224  user=root
    Jan  9 04:11:56 albus sshd[24131]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=183.61.135.224  user=root
    Jan  9 04:12:18 albus sshd[24158]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=183.61.135.224  user=root
    Jan  9 04:12:39 albus sshd[24181]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=183.61.135.224  user=root
    Jan  9 04:13:04 albus sshd[24208]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=183.61.135.224  user=root
    Jan  9 04:13:30 albus sshd[24236]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=183.61.135.224  user=root
    Jan  9 04:13:56 albus sshd[24258]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=183.61.135.224  user=root
    Jan  9 04:14:18 albus sshd[24290]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=183.61.135.224  user=root
    Jan  9 04:14:39 albus sshd[24313]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=183.61.135.224  user=root
    Jan  9 04:15:03 albus sshd[24335]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=183.61.135.224  user=root
There's one problem with that log: it doesn't tell me what password was attempted! Yeah, yeah, it's a security risk if `openssh-server` allowed that, but this is my machine dammit! I'm root, I'll
do whatever the hell I want. And I really want to know what passwords the bot is guessing. Luckily, someone was in the same boat as me, and I followed [his guide](http://www.adeptus-mechanicus.com/codex/logsshp/logsshp.html) exactly.
And it's working out well for me. A few notes though:
* To compile the `libpam-storepw`, you need to `apt-get install libpam0g-dev`.
* To log root logins, you unfortunately have to enable root login to ssh. In `/etc/ssh/sshd_config`, change/add `PermitRootLogin yes`.
* Little tip if your SSH hangs for a while on connection. It's trying to do a reverse DNS lookup. Disable it in `/etc/ssh/sshd_config` with `UseDNS no`
