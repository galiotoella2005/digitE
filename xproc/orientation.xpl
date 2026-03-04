<?xml version="1.0" encoding="UTF-8"?>
<p:declare-step xmlns:p="http://www.w3.org/ns/xproc"
    xmlns:c="http://www.w3.org/ns/xproc-step" version="3.0">
    <p:input port="source">
        <p:inline>
            <xml>
                <move>
                    <name>Acid Spray</name>
                    <type>Poison</type>
                    <category>Special</category> 
                    <power>40</power> 
                    <accuracy>100</accuracy> 
                    <pp>20</pp> 
                    <effect>Sharply lowers opponent's Special Defense.</effect>
                </move>
            </xml>
        </p:inline>
    </p:input>
    <p:output port="result"/>
    
    <p:filter select="/xml/move[1]/name"></p:filter>
    <p:add-attribute attribute-name="my-att" attribute-value="true"/>
</p:declare-step>