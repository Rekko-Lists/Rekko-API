# Rekko-API

### REDIRECT STATUS VALUES

- success
- expired
- invalid
- user_not_found
- token_used
- email_taken

### USER VALID ROLES

- USER
- MODERATOR
- ADMIN

### USER REPUTATION REASONS

- good_post: 10
- helpful_comment: 5
- spam: -15
- bad_behavior: -20
- misinformation: -10

### OAUTH PROVIDERS

- Google
- Discord

### USER IMAGES INFO

Max size user images:

- Profile: 2MB
- Banner: 1MB
- Background: 2MB

Valid format user images:

- jpeg / jpg
- webp
- png

Resolution user images:

- Profile: 400x400
- Banner: 1500x500
- Background: 1920x1080

### USER REFRESH TOKEN

Hay funcionalidades en refreshToken.controller que por temas de seguridad y tal estaria interesante de tener pero por ahora priorizamos seguir adelante y implementarlo en un futuro

###### Cuando esto salga a produccion hay que cambiar toda la info del .env al dominio real
