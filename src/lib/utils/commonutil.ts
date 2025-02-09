function checkNumber(value: string) {
  const number = parseInt(value);
  if (isNaN(number)) {
    return false;
  }
  return true;
}

function checkDomain(domain: string) {
  if (domain.startsWith("http://") || domain.startsWith("https://")) {
    return true;
  }
  return false;
}

function getQueryParams(url: string, ...params: string[]): Record<string, string> {
  const urlObj = new URL(url);
  const searchParams = new URLSearchParams(urlObj.search);
  const result: Record<string, string> = {};

  params.forEach(param => {
      if (searchParams.has(param)) {
          result[param] = searchParams.get(param) as string;
      }
  });

  return result;
}



function createPath(pathTemplate: string, fileMd5: string, extName: string) {
  // {year}/{month}/{day}/{md5}{extName} or custom/{md5}{extName}
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  pathTemplate = pathTemplate.replace(/{year}/g, year.toString());
  pathTemplate = pathTemplate.replace(/{month}/g, month.toString());
  pathTemplate = pathTemplate.replace(/{day}/g, day.toString());
  pathTemplate = pathTemplate.replace(/{md5}/g, fileMd5);
  pathTemplate = pathTemplate.replace(/{extName}/g, extName);
  return pathTemplate;
}

export { checkNumber, checkDomain, createPath, getQueryParams }