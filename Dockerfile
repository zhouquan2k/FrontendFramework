# production stage
FROM nginx:stable-alpine as production-stage
#COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf
COPY http.conf /etc/nginx/http.conf
EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
# Overriding the default NGINX container behavior
COPY ./gen_environment_variables.sh /gen_environment_variables.sh
RUN chmod +x /gen_environment_variables.sh
CMD ["/gen_environment_variables.sh"]