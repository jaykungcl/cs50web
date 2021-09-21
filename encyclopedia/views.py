from django.shortcuts import render
from random import randint

from . import util

import re
from django import forms
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse

class NewEntryForm(forms.Form):
    title = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control'}))
    content = forms.CharField(widget=forms.Textarea(attrs={'class': 'form-control'}))
    edit = forms.BooleanField(initial=False, widget=forms.HiddenInput(), required=False)

def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def search(request):
    query = request.GET.get("q", "")
    entries = util.list_entries()

    resultEntries = []

    for entry in entries:
        if query.upper() == entry.upper():
            return HttpResponseRedirect(reverse("encyclopedia:entry", kwargs={"title":query}))
        if query.upper() in entry.upper():
            resultEntries.append(entry)

    return render(request, "encyclopedia/search.html", {
        "query": query,
        "results": resultEntries
    })

def create(request):
    if request.method == "POST":
        form = NewEntryForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data["title"]
            content = form.cleaned_data["content"]
            edit = form.cleaned_data["edit"]

            print(edit)

            if util.get_entry(title) is None or edit: 
                util.save_entry(title, content)
                return HttpResponseRedirect(reverse("encyclopedia:entry", kwargs={"title":title}))
            else:
                return render(request, "encyclopedia/create.html", {
                    "form": form,
                    "exist": True,
                    "entry": title
                })
        else:
            return render(request, "encyclopedia/create.html", {
                "form": form,
                "exist": False
            })
    
    return render(request, "encyclopedia/create.html", {
        "form": NewEntryForm()
    })

        
def edit(request, title):
            
    content = util.get_entry(title)
    return render(request, "encyclopedia/create.html", {
        "form": NewEntryForm({
            "title": title, 
            "content": content,
            "edit": True
        })
    })

def entry(request, title):
    
    entry = util.get_entry(title)
    if entry is None:
        return render(request, "encyclopedia/notfound.html", {
            "title": title
        })

    entry_html = markdown_to_html(entry)

    return render(request, "encyclopedia/entry.html", {
        "title": title,
        "entry": entry_html
    })

def random(request):
    entries = util.list_entries()
    title = entries[randint(0, len(entries) - 1)]

    return HttpResponseRedirect(reverse("encyclopedia:entry", kwargs={"title":title}))


def markdown_to_html(entry):
    h1 = "((?<=^)|(?<=\n))#\s(.+)(?=\n|$)"
    entry = re.sub(h1, r"<h1>\2</h1>", entry)
    h2 = "((?<=^)|(?<=\n))##\s(.+)(?=\n|$)"
    entry = re.sub(h2, r"<h2>\2</h2>", entry)
    h3 = "((?<=^)|(?<=\n))###\s(.+)(?=\n|$)"
    entry = re.sub(h3, r"<h3>\2</h3>", entry)
    h4 = "((?<=^)|(?<=\n))####\s(.+)(?=\n|$)"
    entry = re.sub(h4, r"<h4>\2</h4>", entry)
    h5 = "((?<=^)|(?<=\n))#####\s(.+)(?=\n|$)"
    entry = re.sub(h5, r"<h5>\2</h5>", entry)
    h6 = "((?<=^)|(?<=\n))######\s(.+)(?=\n|$)"
    entry = re.sub(h6, r"<h6>\2</h6>", entry)

    # p = "(?:^|\n)([^#\(\[\n-].+)(?=\n|$)"
    # entry = re.sub(p, r"<p>\1</p>", entry)

    b = "(?<=[^\*])(\*\*|__)([^*_\n]+)(\*\*|__)(?=[^\*?])"
    entry = re.sub(b, r"<b>\2</b>", entry)
    i = "(?<=[^\*])(\*|_)([^*_\n]+)(\*|_)(?=[^\*?])"
    entry = re.sub(i, r"<i>\2</i>", entry)
    bi = "(?<=[^\*])(\*\*\*|___)([^*_\n]+)(\*\*\*|___)(?=[^\*?])"
    entry = re.sub(bi, r"<b><i>\2</i></b>", entry)
    
    a = "\[([\w\s\.*-]+)\]\(([\w\/\.-]+)\)"
    entry = re.sub(a, r"<a href='\2'>\1</a>", entry)

    li = "((?<=^)|(?<=\n))(-|\*|[0-9]+\.)\s(.+)(?=\n|$)"    
    entry = re.sub(li, r"<li>\3</li>", entry)
    ul = "((?<=^)|(?<=\n))(((-|\*)\s(.+)\n)+)(?=[^*-])"
    entry = re.sub(ul, r"<ul>\2</ul>", entry)
    ol = "((?<=^)|(?<=\n))((([0-9]+\.)\s(.+)\n)+)(?=[^0-9])"
    entry = re.sub(ol, r"<ol>\2<ol>", entry)

    return entry
