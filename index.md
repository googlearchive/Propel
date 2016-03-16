---
layout: default
---
{% assign staticFiles = site.static_files | sort: 'path' | reverse%}
{% assign currentTopLevelName = '' %}
{% assign currentVersionName = '' %}

{% for file in staticFiles %}
  {% if file.extname != '.html' %}
    {% continue %}
  {% endif %}

  {% comment %}
    The first forward slash in the path means pathParts[0] == ''
  {% endcomment %}
  {% assign pathParts = file.path | split: '/' %}
  {% assign topLevelGroup = pathParts[1] %}

  {% if currentTopLevelName != topLevelGroup %}
{% assign currentTopLevelName = topLevelGroup %}
{% if currentTopLevelName == 'master' %}
  <h1>Master Branch</h1>
{% elsif currentTopLevelName == 'releases' %}
  <h1>Releases</h1>
{% endif %}
  {% endif %}

{% if currentTopLevelName == 'master' %}
  <p><a href="{{ file.path | prepend: site.baseurl }}">View the Docs for the Master Branch</a></p>
{% elsif currentTopLevelName == 'releases' and currentVersionName != pathParts[2] %}
  {% assign currentVersionName = pathParts[2] %}
  <p><a href="{{ file.path | prepend: site.baseurl }}">View the Docs for the {{ pathParts[2] }} release</a></p>
{% endif %}

{% endfor %}
