import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link', 'image', 'video'],
  ],
};

const TextEditor = () => {
  const [value, setValue] = useState<string>('');
  const [notes, setNotes] = useState<string[]>([]);

  const addNote = () => {
    notes.push(value);
    setValue('');
    console.log(notes);
  };

  return (
    <div>
      <ReactQuill
        className="h-300"
        theme="snow"
        value={value}
        onChange={setValue}
        modules={modules}
      />
      <button
        type="button"
        className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 mt-2">
        Add Note
      </button>

      <div>{notes}</div>
      <div />
    </div>
  );
};
export default TextEditor;
