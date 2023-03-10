export const DOC_TEMPLATE_DEFAULT_HTML_BODY =`
<h1>h1 Heading {{client name}}</h1>
<h2>h2 Heading</h2>
<h3>h3 Heading</h3>
<h4>h4 Heading</h4>
<h5>h5 Heading</h5>
<h6>h6 Heading</h6>
<p>Pragraph {{company name}}<br><br><strong>Bold</strong></p>
<p><em>Italic {{director name}}</em></p>
<p><span style="text-decoration: underline;">Underline</span></p>
<p><s>Strickethrough</s></p>
<p><span style="font-size: 36pt;">Font&nbsp;size</span></p>
<p>Colorful text</p>
<p><span style="color: rgb(224, 62, 45);">red</span> <span style="color: rgb(45, 194, 107);">green</span> <span style="color: rgb(241, 196, 15);">yellow <span style="background-color: rgb(35, 111, 161); color: rgb(236, 202, 250);">background color</span></span></p>
<blockquote>
<p>Backquoted</p>
</blockquote>
<p>X<sup>2 superscript</sup></p>
<p>Y<sub>1 subscript</sub></p>
<p><a href="https://zeeworkflow.com/terms_and_conditions">Link</a></p>
<p>Align left</p>
<p style="text-align: center;">Align middle</p>
<p style="text-align: right;">Align right</p>
<div>&nbsp;</div>
<div style="text-align: justify;">Aligh justify.Aligh justify.Aligh justify.Aligh justify.Aligh justify.Aligh justify.Aligh justify.Aligh justify.Aligh justify.Aligh justify.Aligh justify.Aligh justify.Aligh justify.Aligh justify.Aligh justify.Aligh justify.Aligh justify. {{client name}}</div>
<p>Indent 1</p>
<p style="padding-left: 40px;">Indent 2</p>
<p style="padding-left: 80px;">Indent 3</p>
<p style="padding-left: 120px;">Indent 4</p>
<p>&nbsp;</p>
<p class="line" data-line="75">Ordered</p>
<ol>
<li>
<p>Lorem ipsum dolor sit amet {{director title}}</p>
</li>
<li>
<p>Consectetur adipiscing elit</p>
</li>
<li>
<p>Integer molestie lorem at massa</p>
</li>
<li>
<p>You can use sequential numbers&hellip;</p>
</li>
<li>
<p>&hellip;or keep all the numbers as&nbsp;</p>
</li>
</ol>
<p>&nbsp;</p>
<ol style="list-style-type: upper-alpha;">
<li>
<p>Lorem ipsum dolor sit amet {{director title}}</p>
</li>
<li>
<p>Consectetur adipiscing elit</p>
</li>
<li>
<p>Integer molestie lorem at massa</p>
</li>
<li>
<p>You can use sequential numbers&hellip;</p>
</li>
<li>
<p>&hellip;or keep all the numbers as&nbsp;</p>
</li>
</ol>
<p>&nbsp;</p>
<ul>
<li>
<p>Lorem ipsum dolor sit amet {{director title}}</p>
</li>
<li>
<p>Consectetur adipiscing elit</p>
</li>
<li>
<p>Integer molestie lorem at massa</p>
</li>
<li>
<p>You can use sequential numbers&hellip;</p>
</li>
<li>
<p>&hellip;or keep all the numbers as&nbsp;</p>
</li>
</ul>
<div>&nbsp;</div>
<div>
<table style="border-collapse: collapse; width: 100%;" border="1"><colgroup><col style="width: 25.0366%;"><col style="width: 25.0366%;"><col style="width: 25.0366%;"><col style="width: 24.8902%;"></colgroup>
<tbody>
<tr>
<td>Table&nbsp;</td>
<td>Table</td>
<td>Table</td>
<td>Table</td>
</tr>
<tr>
<td>Cell</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>Row&nbsp;</td>
<td>&nbsp;</td>
<td>Cell</td>
<td>&nbsp;</td>
</tr>
</tbody>
</table>
</div>
<p>&nbsp;</p>
<p>Picture</p>
<p><img src="https://zeeworkflow.com/images/logo-full-primary.svg" width="529" height="109"></p>
<p>&nbsp;</p>
`;