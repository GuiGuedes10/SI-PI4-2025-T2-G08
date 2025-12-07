# SmartGG_backend
Documentação sobre o backend.

Requisitos:
-Mysql server
-Redis
-Api riot key
-Bruno *opcional*

Dentro do backend possuem dois Java server, um usando spring boot para contruir a API e um outro um servidor de serviço.

Para rodar o servidor de serviço basta usar os seguintes comandos
bash'
cd C:..\SI-PI4-2025-T2-G08\SmartGG-backend\JavaServer
javac Server.java
java Server 

para rodar a API é necesserio ter dentro instalado em seu computador todos os requisitos pedidos, após isso é necessario acessar o arquivo src/main/java/resources/application.properties e configurar o que se pede. Então deve-se abrir o cmd e digitar 
bash'
cd C:..\SI-PI4-2025-T2-G08\SmartGG-backend
.\mvnw clean install

caso tudo esteje certo e configurado o mvnw ira instalar todas as dependencias necessarias previstas no arquivo pom.xml.

então dentro do mesmo terminal digite
bash'
.\mvnw spring-boot:run -DskipTests -e

Configuração opcional - Bruno route tester.
Dentro deste projeto existe um arquivo chamado SmartGG_Backend_RouteTestersBruno. Dentro do arquivo possui todas as rotas possiveis da api que caso tenha Bruno instalado no computador basta abrir este arquivo que ele ira automaticamente dar todas as rotas com jsons validos.
