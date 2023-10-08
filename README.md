# Origin: A knowledge base

A side-project aiming to create a knowledge base engine using SQLite and RDF triples.

## Getting started

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## Concepts

### Triples

A Triple describes a piece of datum stored in Origin. A Triple holds 3 values: a subject, a predicate, and an object.

The subject represents the entity the triple refers to, the predicate is the property of the entity that the Triple desceibes, and the object is the value of that property.

#### Example

In Triple form, the sentence "John Doe's email address is john@ac.me" would translate to:

```json
{
   "subject": "John Doe",
   "predicate": "email",
   "object": "john@ac.me"
}
```

### Subjects

Although Origin stores everything as Triples, it also provides APIs that allow users to manipulate subjects directly.

A subject is an aggregate of all triples that refer to a same thing, and that possesses a unique identifier.

#### Example

If we have the following triples:

```json
[
   {
      "subject": "subject:john",
      "predicate": "name",
      "object": "John Doe"
   },
   {
      "subject": "subject:john",
      "predicate": "email",
      "object": "john@ac.me"
   }
]
```

They will constitute the following subject:

```json
{
   "id": "john",
   "name": "John Doe",
   "email": "john@ac.me"
}
```

### Schema

To keep data coherent, Origin keeps track of your knowledge base schema.

You don't have to provide your schema before using Origin, it will automatically infer the type of the predicates you insert.

When creating a new subject, Origin will iterate through every property and check that the right type is used, or add it to the schema after having inferred the type of the value if it is not known yet.

## API

### Create a subject

```
POST /subjects
```

**Body**

```json
{
    "property1": "value1",
    "property2": "value2",
    "property3": "value3",
    ...
}
```

### Read a subject

```
GET /subjects/[id]
```

### SPARQL Query

```
POST /sparql
```

**Body**

```json
"[YOUR SPARQL QUERY]"
```

### Insert new subjecy by using natural language

If you have an OpenAI API key, you can use it in Origin to insert subjects by providing a description in natural language.

```
POST /tell
```

**Body**

```json
"[YOUR DESCRIPTION IN NATURAL LANGUAGE]"
```

### Get schema

```
GET /schema
```
