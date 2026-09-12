window.TEXT_SEARCH_DATA={
  {%- for _collection in site.collections -%}
    {%- unless forloop.first -%},{%- endunless -%}
    '{{ _collection.label }}':[
      {%- assign _printed = false -%}
      {%- for _article in _collection.docs -%}
      {%- if _printed -%},{%- endif -%}
      {'title':{{ _article.title | jsonify }},
      {%- include snippets/prepend-baseurl.html path=_article.url -%}
      {%- assign _url = __return -%}
      'url':{{ _url | jsonify }}}
      {%- assign _printed = true -%}
      {%- endfor -%}
    ]
  {%- endfor -%}
};
