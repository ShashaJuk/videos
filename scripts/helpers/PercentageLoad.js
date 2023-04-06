export class PercentageLoad {
    
  async load(urlArray, setProgress) {
    async function downloadBlob(url, increaseProgress) {
      try {
        const response = await fetch(url);
        const res = new Response(
          new ReadableStream({
            async start(controller) {
              const reader = response.body.getReader();
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                increaseProgress(value.byteLength);
                controller.enqueue(value);
              }
              controller.close();
            },
          })
        );
        return await res.blob();
      } catch (e) {
        console.error("fetch download error:", e, "url:", url);
      }
    }

    async function getfilesize(url) {
      try {
        let response = await fetch(url, {
          method: "HEAD",
        });
        return parseInt(response.headers.get("content-length"), 10);
      } catch (e) {
        console.error("fetch get content length error:", e, "url:", url);
      }
    }

    async function getFilesSize(urlArray) {
      let filesSize = 0;
      for (let url of urlArray) {
        filesSize += await getfilesize(url);
      }
      return filesSize;
    }

    function increaseProgress(value) {
      progress += value;
      const percentage = (progress / filesSize) * 100;
      setProgress(percentage);
    }

    let progress = 0;
    const filesSize = await getFilesSize(urlArray);
    let result = [];

    for (let i = 0; i < urlArray.length; i++) {
      const blob = await downloadBlob(urlArray[i], increaseProgress);
      result.push(blob);
    }

    return result;
  }
}
