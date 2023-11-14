FROM public.ecr.aws/shelf/lambda-libreoffice-base:7.4-node16-x86_64
WORKDIR ${LAMBDA_TASK_ROOT}
COPY package.json src/docxpdf.ts  ./
RUN npm install
RUN npm run build

CMD ["docxpdf.handler"]
