# take default image of node boron i.e  node 6.x
FROM node:9

# create app directory in container
RUN mkdir -p /backend-app

# set /app directory as default working directory
WORKDIR /backend-app

# only copy package.json initially so that `RUN yarn` layer is recreated only
# if there are changes in package.json
ADD package.json yarn.lock /app/

# --pure-lockfile: Don’t generate a yarn.lock lockfile
RUN yarn install --pure-lockfile

# copy all file from current dir to /app in container
COPY . /backend-app/

# expose port 4040
EXPOSE 4040

# cmd to start service
CMD [ "yarn", "start" ]
