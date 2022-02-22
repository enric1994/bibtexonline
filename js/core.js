// VARIABLES

var fromArea = document.getElementById("from");
var toDiv = document.getElementById("todiv");
var formatDropdown = document.getElementById("format");
var ctooltip = document.getElementById("mycTooltip");

// JQUERY: If contents change, call convert function!

$('#from').bind('input propertychange', function () {
    convert()
})

// TEST BUTTONS

function test() {

    fromArea.value = `@inproceedings{azcona2019user2code2vec,
author = {Azcona, David and Arora, Piyush and Hsiao, I-Han and Smeaton, Alan},
title = {User2Code2Vec: Embeddings for Profiling Students Based on Distributional Representations of Source Code},
booktitle = {Proceedings of the 9th International Conference on Learning Analytics \& Knowledge},
series = {LAK19},
year = {2019},
isbn = {978-1-4503-6256-6},
location = {Tempe, AZ, USA},
pages = {86--95},
numpages = {10},
url = {http://doi.acm.org/10.1145/3303772.3303813},
doi = {10.1145/3303772.3303813},
acmid = {3303813},
publisher = {ACM},
address = {New York, NY, USA}
}`;
    convert();

}

function test2() {

    fromArea.value = `@book{madigan1997brock,
title={Brock biology of microorganisms},
author={Madigan, Michael T and Martinko, John M and Parker, Jack and others},
volume={11},
year={1997},
publisher={Prentice hall Upper Saddle River, NJ}
}

@article{tonouchi2007cutting,
title={Cutting-edge terahertz technology},
author={Tonouchi, Masayoshi},
journal={Nature photonics},
volume={1},
number={2},
pages={97},
year={2007},
publisher={Nature Publishing Group}
}  

@phdthesis{corrigan2018investigation,
title={An Investigation Into Machine Learning Solutions Involving Time Series Across Different Problem Domains},
author={Corrigan, Owen},
year={2018},
school={Dublin City University}
}`
    convert();

}

// HELPERS

// Function to compile LaTeX special characters to HTML
var htmlify = function (str) {
    if (!str) { return ''; }
    str = str.replace(/\\"\{a\}/g, '&auml;')
        .replace(/\{\\aa\}/g, '&aring;')
        .replace(/\\aa\{\}/g, '&aring;')
        .replace(/\\"a/g, '&auml;')
        .replace(/\\"\{o\}/g, '&ouml;')
        .replace(/\\'e/g, '&eacute;')
        .replace(/\\'\{e\}/g, '&eacute;')
        .replace(/\\'a/g, '&aacute;')
        .replace(/\\'A/g, '&Aacute;')
        .replace(/\\"o/g, '&ouml;')
        .replace(/\\"u/g, '&uuml;')
        .replace(/\\ss\{\}/g, '&szlig;')
        .replace(/\\ss/g, '&szlig;')
        .replace(/\{/g, '')
        .replace(/\}/g, '')
        .replace(/\\&/g, '&')
        .replace(/--/g, '&ndash;');
    return str;
};

var uriencode = function (str) {
    if (!str) { return ''; }
    str = str.replace(/\\"\{a\}/g, '%C3%A4')
        .replace(/\{\\aa\}/g, '%C3%A5')
        .replace(/\\aa\{\}/g, '%C3%A5')
        .replace(/\\"a/g, '%C3%A4')
        .replace(/\\"\{o\}/g, '%C3%B6')
        .replace(/\\'e/g, '%C3%A9')
        .replace(/\\'\{e\}/g, '%C3%A9')
        .replace(/\\'a/g, '%C3%A1')
        .replace(/\\'A/g, '%C3%81')
        .replace(/\\"o/g, '%C3%B6')
        .replace(/\\"u/g, '%C3%BC')
        .replace(/\\ss\{\}/g, '%C3%9F')
        .replace(/\\ss/g, '%C3%9F')
        .replace(/\{/g, '')
        .replace(/\}/g, '')
        .replace(/\\&/g, '%26')
        .replace(/--/g, '%E2%80%93');
    return str;
};

// Function to get initials from authors
function get_initials(name) {
    var initials = []
    var words = name.split('-')
    for (var index = 0; index < words.length; index++) {
        var word = words[index];
        var initial = word[0];
        initials.push(initial);
    }
    return initials
}

// Function to get authors in a particular format from citations
function authors2html(authorData, vformat) {
    var authorsStr = '';
    var author;
    if (!authorData) { return authorsStr; }
    for (var index = 0; index < authorData.length; index++) {
        if (vformat == 'mla' && index > 0) { authorsStr += " et al"; break; } // MLA: Azcona, David, et al. 
        if (index > 0) { authorsStr += ", "; } // For more than one author, separate them with a comma
        if (index > 0 && index == authorData.length - 1) { // Before adding the last author, add '&'' or 'and' if needed
            if (vformat == 'apa') { authorsStr += "& "; } // & Smeaton, A.
            else if (vformat == 'chicago' || vformat == 'harvard') { authorsStr += "and "; } // and Alan Smeaton
        }
        // Get author
        author = authorData[index];
        if (vformat == 'mla' || vformat == 'chicago') {
            if (index == 0) { authorsStr += author.last + ", " + author.first; } // First: Azcona, David
            else { authorsStr += author.first + ((author.first && author.last) ? ", " : "") + author.last; } // Rest: Piyush Arora
        }
        else {
            var initials = get_initials(author.first)
            if (vformat == 'vancouver') { var separator = ""; } // Azcona, D
            else { separator = "."; } // Azcona, D.
            authorsStr += author.last + ((author.first) ? ", " + initials.join(separator) + separator : "");
        }
    }
    return htmlify(authorsStr);
}

function howpublished2readable(howpublished){
    var howpublishedStr = '';
    if (howpublished && howpublished.startsWith("\\url{") && howpublished.endsWith("}")) {
        var uri = howpublished.split("\\url{")[1].split("}")[0];
        howpublishedStr = '<a href="' + uri + '" target="_blank">' + uri + '</a>';
    }
    return htmlify(howpublishedStr);
}

// Function to format month from number to its corresponding name
function getMonthName(month) {
    var d = new Date();
    d.setMonth(month-1);
    var monthName = d.toLocaleString("default", { month: "short" });
    return monthName;
}

// Function to format the citation based on the format selected
function format(data) {

    // Format value: MLA, APA, Chicago, Harvard, Vancouver
    var formatValue = formatDropdown.options[formatDropdown.selectedIndex].value;

    // Format authors
    var authors = authors2html(data.author, formatValue);

    // http://bib-it.sourceforge.net/help/fieldsAndEntryTypes.php#article
    // ARTICLE
    // An article from a journal or magazine.
    // Required fields: author, title, journal, year.
    // Optional fields: volume, number, pages, month, note.
    if (data.entryType == "article") {
        authors = ((authors) ? authors : "Authors are required!");
        var title = ((data.title) ? data.title : "<strong style='color:red;'>Title is required!</strong>");
        var journal = ((data.journal) ? data.journal : "<strong style='color:red;'>Journal is required!</strong>")
        var year = ((data.year) ? data.year : "<strong style='color:red;'>Year is required!</strong>")
        if (formatValue == 'mla') {
            return authors +
                ". \"" + title + "\". " +
                "<em>" + journal + "</em>" +
                ((data.volume) ? " " + data.volume : "") +
                ". " +
                ((data.number) ? " " + data.number : "") + 
                "(" + year + ")" +
                ((data.pages) ? ": " + data.pages : "") +
                ".";
        }
        else if (formatValue == 'apa') {
            return authors +
                " (" + year + "). " + 
                title + 
                "<em>" + ". " + journal + 
                ((data.volume) ? ", <em>" + data.volume : "") +
                "</em>" +
                ((data.number) ? "(" + data.number + ")" : "") + 
                ((data.pages) ? ", " + data.pages : "") +
                ".";
        }
        else if (formatValue == 'chicago') {
            return authors +
                ". \"" + title + "\"." + 
                "<em>" + journal + "</em>" + 
                ((data.volume) ? " " + data.volume : "") +
                ((data.number) ? ", no." + data.number : "") + 
                " (" + year + ")" + 
                ((data.pages) ? ": " + data.pages : "") +
                ".";
        }
        else if (formatValue == 'harvard') {
            return authors +
                " " + year + 
                ". " + title + 
                ". <em>" + journal + 
                ((data.volume) ? ", " + data.volume : "") +
                "</em>" + 
                ((data.number) ? "(" + data.number + ")" : "") + 
                ((data.pages) ? ", p." + data.pages : "") + 
                ".";
        }
        else if (formatValue == 'vancouver') {
            return authors +
                ". \"" + title + "\". " +
                journal + " " +
                year +
                ((data.volume) ? "; " + data.volume : "") +
                ((data.number) ? "(" + data.number + ")" : "") +
                ((data.pages) ? ":" + data.pages : "") + 
                ".";
        }
    }
    // IN PROCEEDINGS
    // An article in a conference proceedings.
    // Required fields: author, title, booktitle, year.
    // Optional fields: editor, volume or number, series, pages, address, month, organization, publisher, note.
    else if (data.entryType == "inproceedings") {
        authors = ((authors) ? authors : "Authors are required!");
        title = ((data.title) ? data.title : "<strong style='color:red;'>Title is required!</strong>");
        var booktitle = ((data.booktitle) ? data.booktitle : "<strong style='color:red;'>Book title is required!</strong>");
        year = ((data.year) ? data.year : "<strong style='color:red;'>Year is required!</strong>");
        if (formatValue == 'mla') {
            return authors +
                ". \"" + title + ".\" " + 
                "<em>" + booktitle + "</em>. " + 
                ((data.publisher) ? data.publisher + ", " : "") +
                year + 
                ".";
        }
        else if (formatValue == 'apa') {
            return authors + 
                " (" + year + "). " + 
                title + 
                ". In <em>" + booktitle + "</em>" + 
                ((data.pages) ? " (pp. " + data.pages + ")" : "") + 
                "." +
                ((data.publisher) ? " " + data.publisher + "." : "");
        }
        else if (formatValue == 'chicago') {
            return authors + 
                ". \"" + title + ".\" " + 
                ". In <em>" + booktitle + "</em>" +
                ((data.pages) ? " (pp. " + data.pages + ")" : "") + 
                "." +
                ((data.publisher) ? " " + data.publisher + ", ": "") +
                year + ".";
        }
        else if (formatValue == 'harvard') {
            return authors + 
                " " + year + 
                ". " + title + 
                ". In <em>" + data.booktitle + "</em>" +
                ((data.pages) ? " (pp. " + data.pages + ")" : "") + 
                "." +
                ((data.publisher) ? " " + data.publisher + ".": "");
        }
        else if (formatValue == 'vancouver') {
            return authors + 
                title + 
                ". In " + booktitle + " " +
                data.year + " " + 
                ((data.pages) ? " (pp. " + data.pages + ")" : "") + 
                "." +
                ((data.publisher) ? " " + data.publisher + ".": "");
        }
    }
    // BOOK
    // A book with an explicit publisher.
    // Required fields: author or editor, title, publisher, year.
    // Optional fields: volume or number, series, address, edition, month, note.
    else if (data.entryType == "book") {
        authors = ((authors) ? authors : "Authors are required!");
        title = ((data.title) ? data.title : "<strong style='color:red;'>Title is required!</strong>");
        var publisher = ((data.publisher) ? data.publisher : "<strong style='color:red;'>Publisher is required!</strong>");
        year = ((data.year) ? data.year : "<strong style='color:red;'>Year is required!</strong>");
        if (authors == "Authors are required!") { 
            authors = ((data.editor) ? data.editor : "<strong style='color:red;'>Author or Editor is required!</strong>");
        }
        if (formatValue == 'mla') {
            return authors + 
                ". <em>" + title + "</em>." + 
                ((data.volume) ? " Vol. " + data.volume : "") +  
                ". " + 
                publisher + ", " + 
                year + ".";
        }
        else if (formatValue == 'apa') {
            return authors + 
                " (" + year + "). <em>" + 
                title + "</em>." +
                ((data.volume) ? " (Vol. " + data.volume + ") " : " ") +  
                publisher + ".";
        }
        else if (formatValue == 'chicago') {
            return authors + 
                ". <em>" + title + "</em>." +
                ((data.volume) ? " Vol. " + data.volume + ". ": "") + 
                publisher + ", " + 
                year + ".";
        }
        else if (formatValue == 'harvard') {
            return authors + " " +
                year + ". " + 
                ". <em>" + title + "</em>." + 
                ((data.volume) ? " (Vol. " + data.volume + "). " : " ") +
                publisher + ".";
        }
        else if (formatValue == 'vancouver') {
            return authors + ". " + 
                title + ". " + 
                publisher + "; " + 
                year + ".";
        }
    }
    // PHD THESIS
    // A Ph.D. thesis.
    // Required fields: author, title, school, year.
    // Optional fields: type, address, month, note.
    else if (data.entryType == 'phdthesis') {
        authors = ((authors) ? authors : "Authors are required!");
        title = ((data.title) ? data.title : "<strong style='color:red;'>Title is required!</strong>");
        var school = ((data.school) ? data.school : "<strong style='color:red;'>School is required!</strong>");
        year = ((data.year) ? data.year : "<strong style='color:red;'>Year is required!</strong>");
        if (formatValue == 'mla') {
            return authors + 
                ". <em>" + title + "</em>" +
                ". Diss." + school + 
                ", " + year + ".";
        }
        else if (formatValue == 'apa') {
            return authors + 
                " (" + year + "). " + 
                "<em>" + title + "</em>." +
                " (Doctoral dissertation, " + school + ").";
        }
        else if (formatValue == 'chicago') {
            return authors + 
                ". \"" + title + ".\" " + 
                "PhD diss., " + school + ", " + 
                year + ". ";
        }
        else if (formatValue == 'harvard') {
            return authors + 
                ", " + year + 
                ". <em>" + title + "</em>." + 
                " (Doctoral dissertation, " + school + ").";
        }
        else if (formatValue == 'vancouver') {
            return authors + 
                ". <em>" + title + "</em>" + 
                " (Doctoral dissertation, " + school + ").";
        }
    }
    // TECH REPORT
    // A report published by a school or other institution, usually numbered within a series.
    // Required fields: author, title, institution, year.
    // Optional fields: type, number, address, month, note.
    else if (data.entryType == 'techreport') {
        authors = ((authors) ? authors : "Authors are required!");
        title = ((data.title) ? data.title : "<strong style='color:red;'>Title is required!</strong>");
        var institution = ((data.institution) ? data.institution : "<strong style='color:red;'>Institution is required!</strong>");
        year = ((data.year) ? data.year : "<strong style='color:red;'>Year is required!</strong>");
        if (formatValue == 'mla') {
            return authors +
                ". <em>" + title + "</em>" +
                ". " + institution + "," +
                ((data.month) ? " " + getMonthName(data.month) : "") +
                " " + year +
                ((data.howpublished) ? ", " + howpublished2readable(data.howpublished) + ".": ""); // MLA omits all other fields
        }
        else if (formatValue == 'apa') {
            return authors +
                " (" + year + "). " +
                "<em>" + title + "</em>" +
                " [White paper]. " + institution + "." +
                ((data.howpublished) ? " " + howpublished2readable(data.howpublished): ""); // APA omits all other fields
        }
        else if (formatValue == 'chicago') {
            return authors +
                ". " + year + ". " +
                "\"" + title + ".\"" +
                " " + institution + "," +
                ((data.month) ? " " + getMonthName(data.month) : "") +
                " " + year + "." +
                ((data.howpublished) ? " " + howpublished2readable(data.howpublished): ""); // CMOS omits all other fields
        }
        else if (formatValue == 'harvard') {
            var today = new Date(); // For access date
            var date = today.getDate() + 
                ' ' + today.toLocaleString('default', { month: 'short' }) + // Month name
                ' ' + today.getFullYear(); 
            return authors +
                " (" + year + ") " +
                title + "." +
                ((data.howpublished) ? " Available at: " + howpublished2readable(data.howpublished): "") +
                " (Accessed: " + date + ").";
        }
        else if (formatValue == 'vancouver') {
            return authors +
                ". " + title +
                ". " + institution + 
                ((data.month) ? "; " + data.year + " " + getMonthName(data.month) + "." : "; " + data.year + ".") +
                ((data.number) ? " Report No.:" + data.number : "");
        }
    }
    // MISC
    // Use this type when nothing else fits. A warning will be issued if all optional fields are empty 
    // (i.e., the entire entry is empty or has only ignored fields).
    // Required fields: none.
    // Optional fields: author, title, howpublished, month, year, note.
    else if (data.entryType == 'misc') {
        if (formatValue == 'mla' || formatValue == 'chicago') {
            return ((authors) ? authors + ". ": "") + 
                ((data.title) ? "\"" + data.title + ".\" ": "") +  
                ((data.howpublished) ? howpublished2readable(data.howpublished) + ". ": "") +
                ((data.year) ? " (" + data.year + "). ": "");
        }
        else if (formatValue == 'apa'|| formatValue == 'harvard') {
            return ((authors) ? authors + ". ": "") + 
                ((data.year) ? " (" + data.year + "). ": "") +
                ((data.title) ? data.title + ". ": "") +  
                ((data.howpublished) ? howpublished2readable(data.howpublished) + ". ": "");
        }
        else if (formatValue == 'vancouver') {
            return ((authors) ? authors + ". ": "") + 
                ((data.title) ? data.title + ". ": "") +  
                ((data.howpublished) ? howpublished2readable(data.howpublished) + ". ": "");
        }
    }
    // Otherwise
    else {
        return 'Format ' + data.entryType + ' not supported yet!'
    }
}

// Function called to convert BibTeX to other format
function convert() {

    // Reset output
    // toInput.value = '';
    toDiv.innerHTML = '';

    // Contents to format
    var contents = fromArea.value;

    // If empty, return nothing!
    if (contents == '') {
        console.log('Contents are empty!');
        return;
    }

    // BIBTEX PARSER
    bibtex = new BibTex();
    bibtex.content = contents;
    bibtex.parse();
    console.log(bibtex);

    // For each parsed citation
    for (var i in bibtex.data) {

        // Get citation
        var citation = bibtex.data[i];

        // Format citation
        var output = format(citation);
        
        // Show
        // toInput.value += htmlify(output) + "\n\n";
        toDiv.innerHTML += htmlify(output) + "<br><br>";
    }
}

// Copy text & tooltip!
function copyFunction() {
    
    var div = document.createRange();
    window.getSelection().removeAllRanges(); // clear current selection
    div.setStartBefore(toDiv);
    div.setEndAfter(toDiv) ;
    window.getSelection().addRange(div);
    document.execCommand("copy"); // Copy!
    ctooltip.innerHTML = "Copied!"; // Tooltip!
}

// Tooltip after copying!
function outFunc() {
    ctooltip.innerHTML = "Copy to clipboard"; // Tooltip!
}
