---
layout: post
title: "My long lost friend, Jekyll"
description: "A prelude of how this site came about."
category: thoughts
tags: [jekyll, github, links, intro]
---
{% include JB/setup %}

Like many others on the interwebz, I switched over to [GitHub pages](http://pages.github.com/) as my 'blogging' platform.
My 2010 New Years resolution was to blog on [WordPress](http://wordpress.com). I was diligent the first few weeks, and well, we all know what happens to those resolutions.
It was a resultant of increased schoolwork and the lack of ease - I wanted something quick and easy to jot down notes - a technical journal I keep of all the things and snippets of code
I learn. Syntax highlighting wasn't baked in, nor do I care for the bloated PHP/MySQL requirements.

Next I tried [dokuwiki](https://www.dokuwiki.org/dokuwiki). The functionalities for me was a step up - I spend most of my time in a console, and it is nice to be able to create and edit my
notes in Vim. I didn't care for the [Dokuwiki syntax](https://www.dokuwiki.org/wiki:syntax). Formatting is ugly and difficult to edit.

Now, [Jekyll](https://github.com/mojombo/jekyll). My beauty. It's love at first sight -- almost. 

Definitely love it is static, yet dynamic. Uses [markdown](http://daringfireball.net/projects/markdown/) for content. Incorporated with GitHub Pages, and that's two goodness in one:
free hosting and uses `git` for revision control. Both my content generation source code and Jekyll are open source. It's a ruby gem.

Unfortunately, it took me a while to get set up, mainly because I didn't understand how everything hooks up. From GitHub Pages to Jekyll to running a local server to adding a new post.
Running a GitHub Page is dead simple: create a repository named `<USERNAME>.github.com`, and voilà, you're done.

You can choose to either run your page as is (i.e. static assets), or set it up in Jekyll's basic file structure and have it generate pages for you.

If you choose the latter, (which is the whole point of this post), you can use GitHub's [automatic generator](https://help.github.com/articles/creating-pages-with-the-automatic-generator).
Now, I haven't exactly figured out what the hell that is, and the documentation on it is a little lacking. Lost at this point, I used the trusty 'ol Google and found this blog:
[Building a blog using Jekyll, Bootstrap and Github pages. A beginners guide!](http://in-the-attic.com/2013/01/04/building-a-blog-using-jekyll-bootstrap-and-github-pages-a-beginners-guide/),
which led me to [How I built my blog in one day](http://erjjoines.github.com/blog/How-I-built-my-blog-in-one-day/), which led me to [Jekyll Bootstrap](http://jekyllbootstrap.com/)

And holy hell, the bootstrap is fantastic. Follow through, and you won't be disappointed. Now, my *2013* resolution is to maintain and continually update this blog.

## Helpful links
Stolen from [Jekyll's GitHub](https://github.com/mojombo/jekyll) readme:
* Put information on your site with [Template Data](http://wiki.github.com/mojombo/jekyll/template-data)
* Customize the [Permalinks](http://wiki.github.com/mojombo/jekyll/permalinks) your posts are generated with
* Use the built-in [Liquid Extensions](http://wiki.github.com/mojombo/jekyll/liquid-extensions) to make your life easier
* [Markdown syntax](http://daringfireball.net/projects/markdown/syntax)
* Jekyll Boostrap [quickstart on creating a post with rake](http://jekyllbootstrap.com/usage/jekyll-quick-start.html#2_create_a_post)
