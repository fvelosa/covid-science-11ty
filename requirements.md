- groupBy topic

+ authors
- authors and tags as distinct collections
- Analytics
- document type
- heroes and vilans
- resources
  - logos
  - images
  - group by resource type
- Topics have questions and use tags
- Video rating
- Video timestamp spotify and odysee
- Video duration
- Improve video load performance
- postmaster
- contributions
- spread the word
- Whos is this for
  - Vaccinated
  - Unvaccinated
  - Child
  - Adverse events
  - Long COVID
- Lists per tag and author, now they only work in sequence of posts
- Improve performance https://www.npmjs.com/package/eleventy-plugin-youtube-embed and lite-youtube/embed


```plantuml
@startuml
class Post {

}

class Podcast {

}

class News {

}

class Paper {

}

class NGO {

}

class Person {

}

class Tag {

}

class Clip {

}

Podcast -- Clip
Podcast -- Tag
Podcast -- Author
Podcast -- Person

@enduml
```
