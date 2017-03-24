let md = markdownit();
let $dropZone = $('.drop-zone');
let $fileList = $('.file-list');
let $downloadBtn = $('.download-btn');

$dropZone
	.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
		e.preventDefault();
		e.stopPropagation();
	})
	.on('dragover dragenter', function() {
		$dropZone.addClass('drag-over');
	})
	.on('dragleave dragend drop', function() {
		$dropZone.removeClass('drag-over');
	})
	.on('drop', function(e) {
		var droppedFileArray = Array.from(e.originalEvent.dataTransfer.files);

		$fileList.html(droppedFileArray.map(file => `<li> ${file.name}</li>`).join(''));

		Promise.all(droppedFileArray.map(file => promiseReader(file)))
			.then(
				readers => {
					let result = readers.map((reader, i) => {
						let html = reader.result;
						let mdStr = md.render(html).replace(/\r?\n/g, '');
						let filename = droppedFileArray[i].name;
						let lang = /en/i.test(filename) ? 'en' : 'zh';
						let role = /admin/i.test(filename) ? 'admin' : 'agent';
						return {
							[lang + '_' + role]: mdStr
						};
					});
					let jsonStr = JSON.stringify(result);
					let blob = new Blob([jsonStr]);
					let url = URL.createObjectURL(blob);
					$downloadBtn.attr('href', url).removeClass('hide');
				},
				err => console.error(err)
			);
	});

let promiseReader = file => new Promise(function(resolve, reject) {
	let reader = new FileReader();

	reader.onload = () => {
		resolve(reader);
	};
	reader.onerror = reject;
	reader.readAsText(file);
});

