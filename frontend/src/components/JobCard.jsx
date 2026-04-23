import React from 'react';
import { Link } from 'react-router-dom';
import { FiBookmark, FiStar } from 'react-icons/fi';
import { TbBriefcase, TbMapPin } from 'react-icons/tb';
import { LiaRupeeSignSolid } from 'react-icons/lia';
import { BsCardText } from 'react-icons/bs';

function JobCard({ job }) {
  return (
    <div className="job-card">
      <div className="job-card-top">
        <div className="job-card-info">
          <Link to={`/job/${job.id}`} className="job-title-link">
            <h2 className="job-title">{job.title}</h2>
          </Link>
          <div className="company-details">
            <span className="company-name">{job.company}</span>
            <span className="rating-container">
              <FiStar className="star-icon" />
              <span className="rating-value">{job.rating}</span>
            </span>
            <span className="separator">|</span>
            <span className="reviews-count">{job.reviews}</span>
          </div>
        </div>
        <div className="company-logo-placeholder">
          <div className="logo-circle">
            <span></span>
          </div>
        </div>
      </div>

      <div className="job-meta">
        <div className="meta-item">
          <TbBriefcase className="meta-icon" />
          <span>{job.experience}</span>
        </div>
        <span className="separator">|</span>
        <div className="meta-item">
          <LiaRupeeSignSolid className="meta-icon" />
          <span>{job.salary}</span>
        </div>
        <span className="separator">|</span>
        <div className="meta-item">
          <TbMapPin className="meta-icon" />
          <span>{job.location}</span>
        </div>
      </div>

      <div className="job-description">
        <BsCardText className="desc-icon" />
        <p>{job.description}</p>
      </div>

      <div className="job-tags">
        {job.tags.map((tag, idx) => (
          <React.Fragment key={idx}>
            <span className="tag">{tag}</span>
            {idx < job.tags.length - 1 && <span className="tag-dot">•</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="job-card-bottom">
        <span className="posted-time">{job.postedAgo}</span>
        <button className="save-btn">
          <FiBookmark className="bookmark-icon" />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
}

export default JobCard;
