---
layout: post
title: "Car leasing and Negogiations"
description: "A prelude of how this site came about."
category: thoughts
tags: [jekyll, github, links, intro]
---
{% include JB/setup %}

http://stackoverflow.com/questions/8413443/when-running-selenium-with-capybara-rails-how-do-i-configure-the-server
  Capybara.run_server = true #Whether start server when testing
  Capybara.server_port = 8200
  Capybara.default_selector = :css #:xpath #default selector , you can change to :css
  Capybara.default_wait_time = 5 #When we testing AJAX, we can set a default wait time
  Capybara.ignore_hidden_elements = false #Ignore hidden elements when testing, make helpful when you hide or show elements using javascript
  Capybara.javascript_driver = :selenium #default driver when you using @javascript tag
  # Other option is:
  # Capybara.javascript_driver = :webkit
