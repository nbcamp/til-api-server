. ./.env

while
  mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p"${DB_PASSWORD}" -e "show databases;" | grep -q "${DB_NAME}"
  [ $? -ne 0 ]
do
  echo "Waiting for database(${DB_PORT}) connection..."
  sleep 2
done

bun migrate
bun start:prod
