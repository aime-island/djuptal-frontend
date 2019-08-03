import React from 'react';
import Item from './Item';

export const Recordings = (props) => (
    <div className="recordings-list">
        { 
            props.recordings.map((recording, i) => {
                return <Item key={i} 
                    recording={recording} 
                    addTranscript={(e) => props.addTranscript(e)}
                    remove={(e) => props.remove(e)} />;
            })
        }
    </div>
)

export default Recordings;